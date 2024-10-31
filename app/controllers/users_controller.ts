import { registerUserValidator } from '#validators/registration'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { createUser, fetchAllUsers, sendVerificationNotice } from '../modules/user/index.js'
import { sendErrorResponse, sendSuccessResponse } from '#utils/index'
import { uploadImage } from '#services/cloudinary'

export default class UsersController {
  async addUser({ request, response }: HttpContext) {
    await db.transaction(async (trx) => {
      const payload = await request.validateUsing(registerUserValidator)

      const avatar = payload.avatar
      const result = await uploadImage(avatar.tmpPath ?? '')
      const user = await createUser({ ...payload, avatar: result.url ?? '' }, trx)
      if (user.$isPersisted) {
        await sendVerificationNotice(user.id, trx, response)
      } else {
        return sendErrorResponse(response, 422, 'Registration failed.')
      }
    })
  }

  async getAllUsers({ request, response }: HttpContext) {
    const page = request.input('page', 1) // Default to page 1
    const limit = request.input('limit', 10) // Default to 10 clients per page

    const clients = await fetchAllUsers(page, limit)

    if (clients.length > 0) {
      sendSuccessResponse(response, 'Clients list fetched successfully', clients)
    } else {
      return sendErrorResponse(response, 404, 'No clients found.')
    }
  }
}
