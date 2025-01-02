import { registerUserValidator } from '#validators/registration'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { createUser, fetchAllUsers, sendVerificationNotice } from '../modules/user/index.js'
import { sendErrorResponse, sendSuccessResponse } from '#utils/index'
import { uploadImage } from '#services/cloudinary'
import User from '#models/user'
import UserRole from '#models/user_role'

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

  async getUserDetails({ params, response }: HttpContext) {
    try {
      const userId = params.id

      const user = await User.query()
        .where('id', userId)
        .preload('role')

        .first()

      if (!user) {
        return sendErrorResponse(response, 404, 'User not found')
      }

      const userRole = await UserRole.query()
        .select(['id', 'role_id'])
        .where('user_id', user.id)
        .preload('role', (roleQuery) => roleQuery.preload('permissions'))
        .first()

      // Transform the data to ensure consistent format
      const transformedUser = {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        phone_number: user.phone_number,
        email: user.email,
        avatar: user.avatar,
        is_active: user.is_active,
        created_at: user.createdAt,
        updated_at: user.updatedAt,
        role: {
          id: userRole?.role.id,
          name: userRole?.role.name,
          permissions: userRole?.role.permissions,
        },
      }

      return sendSuccessResponse(response, 'User details fetched successfully', transformedUser)
    } catch (error) {
      console.error('Error fetching user details:', error)
      return sendErrorResponse(response, 500, 'Error fetching user details', error)
    }
  }
}
