import { addClient } from '#modules/client/index'
import { sendWelcomeEmailToClient } from '#modules/user/index'
import { sendErrorResponse, sendSuccessResponse } from '#utils/index'
import { addClientValidator } from '#validators/registration'
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
}
