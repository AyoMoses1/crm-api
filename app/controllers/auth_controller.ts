import PasswordReset from '#models/password_reset'
import User from '#models/user'
import UserRole from '#models/user_role'
import VerificationToken from '#models/verification_token'
import {
  createPasswordResetToken,
  reverseVerifications,
  verifyEmailAddress,
} from '#modules/auth/index'
import { isAccountActive, isAccountVerified } from '#modules/user/index'
import { AppError } from '#utils/error'
import {
  getDashboardModulesForRole,
  getTokenRes,
  hasDateExpired,
  sendErrorResponse,
  sendSuccessResponse,
} from '#utils/index'
import type { HttpContext } from '@adonisjs/core/http'
import hash from '@adonisjs/core/services/hash'
import logger from '@adonisjs/core/services/logger'
import db from '@adonisjs/lucid/services/db'
import { TransactionClientContract } from '@adonisjs/lucid/types/database'

export default class AuthController {
  async verifyEmail({ request, response }: HttpContext) {
    try {
      const { email, token } = request.body()
      const user = await User.findBy('email', email)
      if (user) {
        const emailVerification = await verifyEmailAddress(user, token)
        logger.info({ emailVerification })
        if (emailVerification) {
          await VerificationToken.query().where('user_id', '=', user.id).delete()
          const passwordResetToken = await createPasswordResetToken(user.id)
          return sendSuccessResponse(response, 'Email verified successfully', {
            reset_token: passwordResetToken,
          })
        }
        await reverseVerifications(user.id)
        return sendErrorResponse(response, 400, 'Email verification failed')
      } else {
        return sendErrorResponse(response, 404, 'Account not found')
      }
    } catch (error) {
      logger.error({ error })
      return sendErrorResponse(response, 500, error)
    }
  }

  async setPassword({ request, response }: HttpContext) {
    try {
      await db.transaction(async (trx: TransactionClientContract) => {
        const { email, token, password } = request.body()
        const user = await User.findBy('email', email, { client: trx })
        if (!user) throw new AppError('User with email not found', 404)
        const record = await PasswordReset.findBy({ user_id: user.id, used: false })
        if (!record) throw new AppError('Invalid or expired token', 404)

        const isTokenValid = await hash.verify(record.reset_token, token)

        if (!isTokenValid || hasDateExpired(record.expires_at.toString()))
          throw new AppError('Invalid or expired token', 400)
        user.password = password
        record.used = true
        await user.useTransaction(trx).save()
        await record.useTransaction(trx).save()

        sendSuccessResponse(response, 'Password reset successful')
      })
    } catch (error) {
      sendErrorResponse(response, error.statusCode, error.message)
    }
  }

  async login({ request, response }: HttpContext) {
    try {
      const { email, password } = request.only(['email', 'password'])
      const { status, code, message, id } = await isAccountActive(email)
      if (!status) return sendErrorResponse(response, code, message)
      if (id) {
        const { verifiedStatus, verifiedCode, verifiedMessage } = await isAccountVerified(id)
        if (!verifiedStatus) return sendErrorResponse(response, verifiedCode, verifiedMessage)
      }
      const user = await User.verifyCredentials(email, password)
      const userRole = await UserRole.query()
        .select(['id', 'role_id'])
        .where('user_id', user.id)
        .preload('role')
        .first()

      const dashboardModules = getDashboardModulesForRole(
        userRole?.role.name.toLocaleLowerCase() ?? ''
      )

      const token = await User.accessTokens.create(user)
      sendSuccessResponse(response, 'User logged in successfully', {
        ...getTokenRes(token),
        id: user.id,
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        avatar: user.avatar,
        role: userRole ? { ...userRole.toJSON() } : null,
        dashboardModules,
      })
    } catch (error) {
      console.log(error)
      sendErrorResponse(response, 403, error.message)
    }
  }

  async google({ ally }: HttpContext) {
    return ally.use('google').redirect((request) => {
      request.param('access_type', 'offline').param('prompt', 'select_account')
    })
  }
}
