import EmailVerification from '#models/email_verification'
import User from '#models/user'
import { Response } from '@adonisjs/core/http'
import UserRole from '#models/user_role'
import VerificationToken from '#models/verification_token'
import { generateVerificationToken, sendSuccessResponse } from '#utils/index'
import { TransactionClientContract } from '@adonisjs/lucid/types/database'
import mail from '@adonisjs/mail/services/main'
import { DateTime } from 'luxon'
import Client from '#models/client'
import Invoice from '#models/invoice'

export const createUser = async (user: UserPayload, trx: TransactionClientContract) => {
  try {
    const account = await User.create(
      {
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        phone_number: user.phone_number,
        is_active: true,
        avatar: user.avatar,
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

export async function sendEmailVerificationOTP(
  userId: number,
  dbTransaction: TransactionClientContract
) {
  const token = generateVerificationToken()
  await VerificationToken.create(
    {
      user_id: userId,
      token,
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
          token: token,
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

export async function sendWelcomeEmailToClient(
  client: Client,
  dbTransaction: TransactionClientContract
) {
  const clientRef = await Client.find(client.id, { client: dbTransaction })
  if (clientRef) {
    await mail.send((message) => {
      message
        .to(clientRef.email)
        .from('ayocandy1@gmail.com')
        .subject('Verify your email address')
        .htmlView('emails/welcome_client_email', {
          client: clientRef,
        })
    })
  } else {
    console.error('User not found')
  }
}

export async function sendCampaignEmailToClient(
  client: Client,
  dbTransaction: TransactionClientContract,
  campaign: any
) {
  const clientRef = await Client.find(client.id, { client: dbTransaction })
  if (clientRef) {
    await mail.send((message) => {
      message
        .to(clientRef.email)
        .from('ayocandy1@gmail.com')
        .subject(campaign.email_header)
        .htmlView('emails/campaign_email', {
          client: clientRef,
          campaign,
        })
    })
  } else {
    console.error('User not found')
  }
}

export async function sendInvoiceEmailToClient(
  client: Client,
  dbTransaction: TransactionClientContract,
  invoice: Invoice,
  paymentUrl: string
) {
  const clientRef = await Client.find(client.id, {
    client: dbTransaction,
  })

  if (clientRef) {
    // Load invoice items with their services
    await invoice.load('items', (query) => {
      query.preload('service')
    })

    // Helper function to format dates and calculations
    const helpers = {
      multiply: (a: number, b: number) => a * b,
      getDaysDifference: (start: string, end: string) => {
        const startDate = new Date(start)
        const endDate = new Date(end)
        return Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24))
      },
    }

    await mail.send((message) => {
      message
        .to(clientRef.email)
        .from('ayocandy1@gmail.com')
        .subject(`Invoice ${invoice.invoice_number} from PayPro`)
        .htmlView('emails/invoice_email', {
          client: clientRef,
          invoice: invoice,
          url: paymentUrl,
          ...helpers,
        })
    })
  } else {
    console.error('Client not found')
  }
}

export const fetchAllUsers = async (page: number, limit: number) => {
  return await User.query()
    .select('id', 'first_name', 'last_name', 'email', 'is_active', 'phone_number', 'avatar')
    .preload('role', (roleQuery) => roleQuery.preload('role'))
    .paginate(page, limit)
}

export const isAccountActive = async (
  email: string
): Promise<{ message: string; status: boolean; code: number; id?: number }> => {
  const user = await User.findBy('email', email)
  if (user) {
    if (user.is_active) {
      return { message: 'Account is active', status: true, code: 200, id: user.id }
    } else {
      return {
        message: 'Account is inactive or deactivated',
        status: false,
        code: 409,
        id: user.id,
      }
    }
  } else {
    return { message: 'Account not found', status: false, code: 404 }
  }
}

export const isAccountVerified = async (
  id: number
): Promise<{ verifiedMessage: string; verifiedStatus: boolean; verifiedCode: number }> => {
  const emailVerification = await EmailVerification.findBy('user_id', id)
  if (emailVerification) {
    if (emailVerification.status === 'Verified') {
      return { verifiedMessage: 'Account is verified', verifiedStatus: true, verifiedCode: 200 }
    } else {
      return {
        verifiedMessage: 'Account is Unverified or Archived',
        verifiedStatus: false,
        verifiedCode: 409,
      }
    }
  } else {
    return { verifiedMessage: 'Account not found', verifiedStatus: false, verifiedCode: 404 }
  }
}
