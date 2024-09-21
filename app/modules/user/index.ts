import EmailVerification from '#models/email_verification'
import User from '#models/user'
import { Response } from '@adonisjs/core/http'
import UserRole from '#models/user_role'
import VerificationToken from '#models/verification_token'
import { sendSuccessResponse } from '#utils/index'
import { TransactionClientContract } from '@adonisjs/lucid/types/database'
import mail from '@adonisjs/mail/services/main'
import { DateTime } from 'luxon'
import logger from '@adonisjs/core/services/logger'

export const createUser = async (user: UserPayload, trx: TransactionClientContract) => {
  try {
    const account = await User.create(
      {
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        phone_number: user.phone_number,
        is_active: true,
      },
      { client: trx }
    )

    await EmailVerification.create(
      {
        status: 'Unverified',
        user_id: account.id,
      },
      { client: trx }
    )

    await UserRole.create(
      {
        user_id: account.id,
        role_id: user.role_id,
      },
      { client: trx }
    )
    return account
  } catch (error) {
    throw new Error('Account creation failed')
  }
}

export function sendVerificationResponse(response: Response, msg?: string) {
  sendSuccessResponse(response, msg ?? 'Email OTP sent for verification')
}

export const sendVerificationNotice = async (
  userId: number,
  trx: TransactionClientContract,
  response?: Response
) => {
  await VerificationToken.query().where('user_id', '=', userId).delete()
  if (response) {
    await sendEmailVerificationOTP(userId, trx)
    sendVerificationResponse(response, 'Email OTP sent for verification')
  }
}

export const generateVerificationCode = () => {
  return Math.floor(Math.random() * (999999 - 111111 + 1)) + 111111
}

export async function sendEmailVerificationOTP(
  userId: number,
  dbTransaction: TransactionClientContract
) {
  const emailOTP = generateVerificationCode()
  logger.info({ emailOTP })
  await VerificationToken.create(
    {
      user_id: userId,
      token: emailOTP,
      used: false,
      expires_at: DateTime.now().plus({ hours: 24 }),
    },
    { client: dbTransaction }
  )

  const userRef = await User.find(userId, { client: dbTransaction })

  if (userRef) {
    await mail.send((message) => {
      message
        .to(userRef.email)
        .from('ayocandy1@gmail.com')
        .subject('Verify your email address')
        .htmlView('emails/verify_email', {
          otp: emailOTP,
          email: userRef.email,
          name: userRef.first_name,
        })
    })
  } else {
    console.error('User not found')
  }
}
export async function sendWelcomeEmail(user: User, dbTransaction: TransactionClientContract) {
  const userRef = await User.find(user.id, { client: dbTransaction })
  if (userRef) {
    await mail.send((message) => {
      message
        .to(userRef.email)
        .from('ayocandy1@gmail.com')
        .subject('Verify your email address')
        .htmlView('welcome', {
          Student: userRef,
        })
    })
  } else {
    console.error('User not found')
  }
}
