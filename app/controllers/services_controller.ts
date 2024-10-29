import { HttpContext } from '@adonisjs/core/http'
import Service from '#models/service'

export default class ServicesController {
  // Add a service
  async addService({ request, response }: HttpContext) {
    const { name, description, price } = request.only(['name', 'description', 'price'])
    const service = await Service.create({ name, description, price })
    return response.status(201).json({ message: 'Service created successfully', service })
  }

  // Update a service
  async updateService({ request, params, response }: HttpContext) {
    const { name, description, price } = request.only(['name', 'description', 'price'])
    const service = await Service.findOrFail(params.id)
    service.merge({ name, description, price })
    await service.save()
    return response.status(200).json({ message: 'Service updated successfully', service })
  }

  // Delete a service
  async deleteService({ params, response }: HttpContext) {
    const service = await Service.findOrFail(params.id)
    await service.delete()
    return response.status(200).json({ message: 'Service deleted successfully' })
  }

  // Fetch all services
  async fetchServices({ response }: HttpContext) {
    const services = await Service.all()
    return response.status(200).json({ services })
  }

  // Fetch a single service
  async fetchServiceDetails({ params, response }: HttpContext) {
    const service = await Service.findOrFail(params.id)
    return response.status(200).json({ service })
  }
}
