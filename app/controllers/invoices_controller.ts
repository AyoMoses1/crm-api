import Client from '#models/client'
import Invoice from '#models/invoice'
import InvoiceItem from '#models/invoice_item'
import Service from '#models/service'
import { sendInvoiceEmailToClient } from '#modules/user/index'
import { generateRandomInvoiceNumber, sendErrorResponse, sendSuccessResponse } from '#utils/index'
import { invoiceGenerationValidator, updateInvoiceStatusValidator } from '#validators/invoice'
import { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { TransactionClientContract } from '@adonisjs/lucid/types/database'

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

        await InvoiceItem.create({
          invoiceId: invoice.id,
          serviceId: serviceRecord.id,
          quantity: service.quantity,
          price: invoice.amount,
        })
      }

      invoice.amount = totalAmount
      invoice.status = 'sent'
      await invoice.save()

      await sendInvoiceEmailToClient(clientRef!, trx, invoice)
      return sendSuccessResponse(response, 'Invoices fetched successfully', invoice)
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
}
