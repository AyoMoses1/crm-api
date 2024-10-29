import { addClient, fetchAllClients, fetchClientById, updateClient } from '#modules/client/index'
import { sendWelcomeEmailToClient } from '#modules/user/index'
import { sendErrorResponse, sendSuccessResponse } from '#utils/index'
import { addClientValidator, updateClientValidator } from '#validators/registration'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

export default class ClientsController {
  async addClient({ request, response }: HttpContext) {
    await db.transaction(async (trx) => {
      const payload = await request.validateUsing(addClientValidator)
      const client = await addClient(payload, trx)
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
