import PasswordReset from '#models/password_reset'
import User from '#models/user'
import VerificationToken from '#models/verification_token'
import {
  createPasswordResetToken,
  reverseVerifications,
  verifyEmailAddress,
} from '#modules/auth/index'
import { AppError } from '#utils/error'
import { hasDateExpired, sendErrorResponse, sendSuccessResponse } from '#utils/index'
import type { HttpContext } from '@adonisjs/core/http'
import hash from '@adonisjs/core/services/hash'
import logger from '@adonisjs/core/services/logger'
import db from '@adonisjs/lucid/services/db'
import { TransactionClientContract } from '@adonisjs/lucid/types/database'

export default class AuthController {
  async verifyEmail({ request, response }: HttpContext) {
    try {
      const { email, otp } = request.body()
      const user = await User.findBy('email', email)
      if (user) {
        const emailVerification = await verifyEmailAddress(user, otp)
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
      await sendErrorResponse(response, error.statusCode, error.message)
    }
  }
}
