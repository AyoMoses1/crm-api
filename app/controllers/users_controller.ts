import { registerUserValidator } from '#validators/registration'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { createUser, sendVerificationNotice } from '../modules/user/index.js'
import { sendErrorResponse } from '#utils/index'

export default class UsersController {
  async addUser({ request, response }: HttpContext) {
    await db.transaction(async (trx) => {
      const payload = await request.validateUsing(registerUserValidator)
      const user = await createUser(payload, trx)
      if (user.$isPersisted) {
        await sendVerificationNotice(user.id, trx, response)
      } else {
        return sendErrorResponse(response, 422, 'Registration failed.')
      }
    })
  }
}
