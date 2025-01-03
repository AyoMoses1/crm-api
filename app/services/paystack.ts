// app/services/paystack_service.ts
import Client from '#models/client'
import Invoice from '#models/invoice'
import env from '#start/env'
import axios from 'axios'

export default class PaystackService {
  private baseUrl = 'https://api.paystack.co'
  private secretKey = env.get('PAYSTACK_SECRET_KEY')

  async initializeTransaction(invoice: Invoice, client: Client) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/transaction/initialize`,
        {
          amount: invoice.amount * 100, // Paystack expects amount in kobo
          email: client.email,
          reference: `INV-${invoice.invoice_number}`,
          callback_url: `https://www.google.com/payments/verify`,
          metadata: {
            invoice_id: invoice.id,
            client_id: client.id,
          },
        },
        {
          headers: {
            'Authorization': `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json',
          },
        }
      )

      return response.data
    } catch (error) {
      console.error('Paystack initialization error:', error)
      throw error
    }
  }

  async verifyTransaction(reference: string) {
    try {
      const response = await axios.get(`${this.baseUrl}/transaction/verify/${reference}`, {
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
        },
      })

      return response.data
    } catch (error) {
      console.error('Paystack verification error:', error)
      throw error
    }
  }
}
