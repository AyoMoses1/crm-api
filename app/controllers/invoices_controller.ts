import Invoice from '#models/invoice'
import InvoiceItem from '#models/invoice_item'
import Service from '#models/service'
import { HttpContext } from '@adonisjs/core/http'

export default class InvoicesController {
  // Generate an invoice
  async generateInvoice({ request, response }: HttpContext) {
    const { client_id, services } = request.only(['client_id', 'services'])

    const invoice = await Invoice.create({ client_id, status: 'draft' })

    let totalAmount = 0

    for (const service of services) {
      const serviceRecord = await Service.findOrFail(service.service_id)
      const amount = serviceRecord.price * service.quantity
      totalAmount += amount

      await InvoiceItem.create({
        invoice_id: invoice.id,
        service_id: serviceRecord.id,
        quantity: service.quantity,
        price: invoice.amount,
      })
    }

    invoice.amount = totalAmount
    invoice.status = 'sent'
    await invoice.save()

    return response.status(201).json({ message: 'Invoice generated successfully', invoice })
  }

  // Update invoice status
  async updateInvoice({ request, params, response }: HttpContext) {
    const { status } = request.only(['status'])
    const invoice = await Invoice.findOrFail(params.id)
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
      .firstOrFail()

    return response.status(200).json({ invoice })
  }
}
