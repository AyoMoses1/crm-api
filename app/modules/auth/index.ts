import User from '#models/user'
import VerificationToken from '#models/verification_token'
import { TransactionClientContract } from '@adonisjs/lucid/types/database'
import hash from '@adonisjs/core/services/hash'
import { generateVerificationToken, hasDateExpired } from '#utils/index'
import EmailVerification from '#models/email_verification'
import PasswordReset from '#models/password_reset'
import { DateTime } from 'luxon'

export async function verifyEmailAddress(
  user: User,
  otp: string,
  trx?: TransactionClientContract
): Promise<boolean> {
  let status = false

  try {
    // Query for the token record
    const emailTokenRecord = await VerificationToken.query()
      .select('*')
      .whereRaw('user_id = ? AND used = ?', [user.id, false])
      .orderBy('id', 'desc')
      .limit(1)

    // Check if the token record exists
    if (!emailTokenRecord[0]) {
      console.error('No token record found')
      return status
    }

    // Verify the token
    let isTokenValid = false
    try {
      isTokenValid = await hash.verify(emailTokenRecord[0].token, otp)
    } catch (verificationError) {
      console.error('Error verifying token:', verificationError)
    }

    // Check if the token has expired
    const expired = hasDateExpired(emailTokenRecord[0].expires_at.toString())
    if (expired) {
      await VerificationToken.query({ client: trx })
        .update({ used: true })
        .where('id', '=', emailTokenRecord[0].id)

      status = false
    } else {
      if (isTokenValid) {
        const verifiedEmail = await EmailVerification.findBy('user_id', user.id, { client: trx })
        if (verifiedEmail) {
          verifiedEmail.status = 'Verified'
          await verifiedEmail.save()
          status = true
        }
      } else {
        status = false
      }
    }
  } catch (error) {
    console.error('Error in verifyEmailAddress function:', error)
    status = false
  }

  return status
}

export async function reverseVerifications(userId: number) {
  await EmailVerification.query()
    .update({
      email_verification_status: 'Unverified',
    })
    .where('user_id', '=', userId)
}

export const createPasswordResetToken = async (userId: number) => {
  try {
    const token = generateVerificationToken()
    await PasswordReset.create({
      user_id: userId,
      reset_token: token,
      expires_at: DateTime.now().plus({ hours: 24 }),
      used: false,
    })
    return token
  } catch (error) {
    throw error
  }
}
