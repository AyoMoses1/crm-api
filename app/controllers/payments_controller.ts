// app/controllers/payments_controller.ts
import type { HttpContext } from '@adonisjs/core/http'
import Payment from '#models/payment'
import logger from '@adonisjs/core/services/logger'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'

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

  // app/controllers/payments_controller.ts
  // ... existing webhook handler ...

  async getAllPayments({ request, response }: HttpContext) {
    try {
      const { page = 1, limit = 10, status, method, startDate, endDate } = request.qs()

      const query = Payment.query()
        .preload('client')
        .preload('invoice')
        .orderBy('createdAt', 'desc')

      // Apply filters
      if (status && status !== 'All') {
        query.where('status', status.toLowerCase())
      }
      if (method && method !== 'All') {
        query.where('payment_method', method.toLowerCase())
      }
      if (startDate && endDate) {
        query.whereBetween('payment_date', [startDate, endDate])
      }

      const payments = await query.paginate(page, limit)

      // Get statistics with proper date handling
      const today = DateTime.now().startOf('day').toFormat('yyyy-MM-dd')
      const monthStart = DateTime.now().startOf('month').toFormat('yyyy-MM-dd')
      const yearStart = DateTime.now().startOf('year').toFormat('yyyy-MM-dd')

      const [todayTotal, monthlyTotal, yearlyTotal] = await Promise.all([
        db.rawQuery(
          'SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = ? AND payment_date >= ?',
          ['completed', today]
        ),
        db.rawQuery(
          'SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = ? AND payment_date >= ?',
          ['completed', monthStart]
        ),
        db.rawQuery(
          'SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = ? AND payment_date >= ?',
          ['completed', yearStart]
        ),
      ])

      return response.json({
        status: true,
        message: 'Payments fetched successfully',
        data: {
          payments: payments,
          statistics: {
            today: Number(todayTotal.rows[0].total),
            monthly: Number(monthlyTotal.rows[0].total),
            yearly: Number(yearlyTotal.rows[0].total),
          },
        },
      })
    } catch (error) {
      logger.error({ error }, 'Error fetching payments')
      return response.status(500).json({
        status: false,
        message: 'Error fetching payments',
        error: error.message,
      })
    }
  }
}
