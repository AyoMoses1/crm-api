import Client from '#models/client'
import Invoice from '#models/invoice'
import InvoiceItem from '#models/invoice_item'
import Payment from '#models/payment'
import Service from '#models/service'
import { sendInvoiceEmailToClient } from '#modules/user/index'
import PaystackService from '#services/paystack'
import env from '#start/env'
import { generateRandomInvoiceNumber, sendErrorResponse, sendSuccessResponse } from '#utils/index'
import { invoiceGenerationValidator, updateInvoiceStatusValidator } from '#validators/invoice'
import { HttpContext } from '@adonisjs/core/http'
import logger from '@adonisjs/core/services/logger'
import db from '@adonisjs/lucid/services/db'
import { TransactionClientContract } from '@adonisjs/lucid/types/database'
import { DateTime } from 'luxon'
import crypto from 'crypto'

export default class InvoicesController {
  async generateInvoice({ request, response }: HttpContext) {
    await db.transaction(async (trx: TransactionClientContract) => {
      const payload = await request.validateUsing(invoiceGenerationValidator)
      const { client_id, services } = payload
      const clientRef = await Client.findBy('id', client_id)

      const invoice = await Invoice.create({
        clientId: client_id,
        status: 'draft',
        invoice_number: generateRandomInvoiceNumber(10),
        amount: 0,
      })

      let totalAmount = 0

      for (const service of services) {
        const serviceRecord = await Service.findOrFail(service.service_id)
        const amount = serviceRecord.price * service.quantity
        totalAmount += amount

        await InvoiceItem.create(
          {
            invoiceId: invoice.id,
            serviceId: serviceRecord.id,
            quantity: service.quantity,
            price: invoice.amount,
          },
          { client: trx }
        )
      }

      invoice.amount = totalAmount
      invoice.status = 'sent'
      await invoice.save()

      const paystackService = new PaystackService()

      const paymentData = await paystackService.initializeTransaction(invoice, clientRef!)

      await Payment.create(
        {
          clientId: client_id,
          invoiceId: invoice.id,
          amount: totalAmount,
          status: 'pending',
          paystack_reference: paymentData.data.reference,
          payment_method: 'paystack',
          payment_date: DateTime.now(),
          payment_channel: '',
          paystack_transaction_id: '',
        },
        { client: trx }
      )

      const invoiceData = {
        ...invoice.toJSON(),
        payment_url: paymentData.data.authorization_url,
      }

      await sendInvoiceEmailToClient(clientRef!, trx, invoice, paymentData.data.authorization_url)
      return sendSuccessResponse(response, 'Invoices generated successfully', invoiceData)
    })
  }

  // fetch all invoices
  async fetchAllInvoices({ response }: HttpContext) {
    try {
      const invoices = await Invoice.query()
        .preload('client') // preload the client related to the invoice
        .preload('items', (itemsQuery) => {
          itemsQuery.preload('service')
        })

      return sendSuccessResponse(response, 'Invoices fetched successfully', invoices)
    } catch (error) {
      return sendErrorResponse(response, 500, 'Error fetching invoices', error)
    }
  }

  // Update invoice status
  async updateInvoice({ request, params, response }: HttpContext) {
    const { status } = await request.validateUsing(updateInvoiceStatusValidator)
    const invoice = await Invoice.findBy('id', params.id)
    if (!invoice) return sendErrorResponse(response, 404, 'invoice not found')
    invoice.status = status
    await invoice.save()
    return response.status(200).json({ message: 'Invoice status updated successfully', invoice })
  }

  // Fetch invoice details
  async fetchInvoiceDetails({ params, response }: HttpContext) {
    const invoice = await Invoice.query()
      .where('id', params.id)
      .preload('client')
      .preload('items')
      .first()

    if (!invoice) return sendErrorResponse(response, 404, 'invoice not found')
    sendSuccessResponse(response, 'invoice fetched successfully', invoice)
  }

  async handleWebhook({ request, response }: HttpContext) {
    try {
      const hash = crypto
        .createHmac('sha512', env.get('PAYSTACK_SECRET_KEY'))
        .update(JSON.stringify(request.body()))
        .digest('hex')

      if (hash !== request.header('x-paystack-signature')) {
        logger.warn('Invalid Paystack webhook signature')
        return response.status(400).json({
          status: false,
          message: 'Invalid signature',
        })
      }

      const event = request.body()
      logger.info({ webhookEvent: event }, 'Received Paystack webhook')

      await db.transaction(async (trx) => {
        if (event.event === 'charge.success') {
          const transaction = event.data

          // Find payment using transaction
          const payment = await Payment.query({ client: trx })
            .where('paystack_reference', transaction.reference)
            .first()

          if (!payment) {
            logger.error({ reference: transaction.reference }, 'Payment not found for webhook')
            return response.status(404).json({
              status: false,
              message: 'Payment not found',
            })
          }

          // Update payment record
          await payment
            .merge({
              status: 'completed',
              paystack_transaction_id: transaction.id,
              payment_channel: transaction.channel,
              payment_date: DateTime.fromJSDate(new Date(transaction.paid_at)),
            })
            .save()

          // Update invoice status
          const invoice = await Invoice.query({ client: trx })
            .where('id', payment.invoiceId)
            .first()

          if (invoice) {
            await invoice
              .merge({
                status: 'paid',
              })
              .save()

            logger.info(
              {
                invoiceId: invoice.id,
                reference: transaction.reference,
              },
              'Payment completed successfully'
            )
          }
        } else if (event.event === 'charge.failed') {
          const transaction = event.data

          // Handle failed payment
          const payment = await Payment.query({ client: trx })
            .where('paystack_reference', transaction.reference)
            .first()

          if (payment) {
            await payment
              .merge({
                status: 'failed',
                paystack_transaction_id: transaction.id,
                payment_channel: transaction.channel,
                payment_date: DateTime.fromJSDate(new Date(transaction.paid_at)),
              })
              .save()

            logger.warn(
              {
                paymentId: payment.id,
                reference: transaction.reference,
              },
              'Payment failed'
            )
          }
        }
      })

      return response.status(200).json({
        status: true,
        message: 'Webhook processed successfully',
      })
    } catch (error) {
      logger.error({ error }, 'Error processing webhook')

      return response.status(500).json({
        status: false,
        message: 'Error processing webhook',
        error: error.message,
      })
    }
  }
}
