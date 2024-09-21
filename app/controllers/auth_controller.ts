import User from '#models/user'
import VerificationToken from '#models/verification_token'
import {
  createPasswordResetToken,
  reverseVerifications,
  verifyEmailAddress,
} from '#modules/auth/index'
import { sendErrorResponse, sendSuccessResponse } from '#utils/index'
import type { HttpContext } from '@adonisjs/core/http'
import logger from '@adonisjs/core/services/logger'

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
}
