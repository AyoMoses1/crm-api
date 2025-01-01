import { addClient, fetchAllClients, fetchClientById, updateClient } from '#modules/client/index'
import { sendWelcomeEmailToClient } from '#modules/user/index'
import { uploadImage } from '#services/cloudinary'
import { sendErrorResponse, sendSuccessResponse } from '#utils/index'
import { addClientValidator, updateClientValidator } from '#validators/registration'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'

export default class ClientsController {
  async addClient({ request, response }: HttpContext) {
    await db.transaction(async (trx) => {
      const payload = await request.validateUsing(addClientValidator)
      const avatar = payload.avatar
      const result = await uploadImage(avatar.tmpPath ?? '')
      const client = await addClient({ ...payload, avatar: result.url ?? '' }, trx)
      if (client.$isPersisted) {
        await sendWelcomeEmailToClient(client, trx)
        sendSuccessResponse(response, 'client registered successfully')
      } else {
        return sendErrorResponse(response, 422, 'Registration failed.')
      }
    })
  }

  async getAllClients({ request, response }: HttpContext) {
    const page = request.input('page', 1) // Default to page 1
    const limit = request.input('limit', 10) // Default to 10 clients per page

    const clients = await fetchAllClients(page, limit)

    if (clients.length > 0) {
      sendSuccessResponse(response, 'Clients list fetched successfully', clients)
    } else {
      return sendErrorResponse(response, 404, 'No clients found.')
    }
  }

  async getClientDetails({ params, response }: HttpContext) {
    const clientId = params.id

    const client = await fetchClientById(clientId)

    if (client) {
      sendSuccessResponse(response, 'Client details fetched successfully', client)
    } else {
      return sendErrorResponse(response, 404, 'Client not found.')
    }
  }

  async getClientStatistics({ response }: HttpContext) {
    try {
      const now = DateTime.now()
      const startOfDay = now.startOf('day')
      const startOfMonth = now.startOf('month')
      const startOfYear = now.startOf('year')

      // Get daily clients count
      const dailyClients = await db
        .from('clients')
        .count('* as count')
        .where('created_at', '>=', startOfDay.toSQL())
        .first()

      // Get monthly clients count
      const monthlyClients = await db
        .from('clients')
        .count('* as count')
        .where('created_at', '>=', startOfMonth.toSQL())
        .first()

      // Get yearly clients count
      const yearlyClients = await db
        .from('clients')
        .count('* as count')
        .where('created_at', '>=', startOfYear.toSQL())
        .first()

      const statistics = {
        today: Number(dailyClients?.count || 0),
        thisMonth: Number(monthlyClients?.count || 0),
        thisYear: Number(yearlyClients?.count || 0),
      }

      return sendSuccessResponse(response, 'Client statistics fetched successfully', statistics)
    } catch (error) {
      return sendErrorResponse(response, 500, 'Failed to fetch client statistics')
    }
  }

  async updateClient({ request, params, response }: HttpContext) {
    const clientId = params.id
    const requestBody = request.all()
    const allowedFields = ['first_name', 'last_name', 'state', 'country', 'address']
    const extraFields = Object.keys(requestBody).filter((field) => !allowedFields.includes(field))

    if (extraFields.length > 0) {
      return sendErrorResponse(response, 422, 'Extra fields are not allowed', extraFields)
    }

    const payload = await request.validateUsing(updateClientValidator)

    const client = await updateClient(clientId, payload)
    if (client) {
      sendSuccessResponse(response, 'Client details updated successfully', client)
    } else {
      return sendErrorResponse(response, 404, 'Client not found.')
    }
  }
}
