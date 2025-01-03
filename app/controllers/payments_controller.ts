// app/controllers/payments_controller.ts
import type { HttpContext } from '@adonisjs/core/http'
import Payment from '#models/payment'
import logger from '@adonisjs/core/services/logger'

export default class PaymentsController {
  // ... existing webhook handler ...

  async getClientPayments({ request, response, params }: HttpContext) {
    try {
      const client_id = params.clientId
      const page = request.input('page', 1)
      const limit = request.input('limit', 10)

      const payments = await Payment.query()
        .where('client_id', client_id)
        .preload('invoice')
        .orderBy('createdAt', 'desc')
        .paginate(page, limit)

      return response.json({
        status: true,
        message: 'Payments fetched successfully',
        data: payments,
      })
    } catch (error) {
      logger.error({ error }, 'Error fetching client payments')
      return response.status(500).json({
        status: false,
        message: 'Error fetching payments',
        error: error.message,
      })
    }
  }

  async getPaymentDetails({ params, response }: HttpContext) {
    try {
      const payment = await Payment.query()
        .where('id', params.id)
        .preload('invoice', (query) => {
          query.preload('items', (itemQuery) => {
            itemQuery.preload('service')
          })
        })
        .preload('client')
        .firstOrFail()

      return response.json({
        status: true,
        message: 'Payment details fetched successfully',
        data: payment,
      })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.status(404).json({
          status: false,
          message: 'Payment not found',
        })
      }

      logger.error({ error }, 'Error fetching payment details')
      return response.status(500).json({
        status: false,
        message: 'Error fetching payment details',
        error: error.message,
      })
    }
  }

  async getPaymentsByInvoice({ params, response }: HttpContext) {
    try {
      const payments = await Payment.query()
        .where('invoice_id', params.invoice_id)
        .preload('client')
        .orderBy('createdAt', 'desc')

      return response.json({
        status: true,
        message: 'Payments fetched successfully',
        data: payments,
      })
    } catch (error) {
      logger.error({ error }, 'Error fetching payments for invoice')
      return response.status(500).json({
        status: false,
        message: 'Error fetching payments',
        error: error.message,
      })
    }
  }
}
