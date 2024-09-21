import { AccessToken } from '@adonisjs/auth/access_tokens'
import { Response } from '@adonisjs/core/http'
import { randomBytes } from 'node:crypto'
import { DateTime, DateTimeFormatOptions } from 'luxon'

export const sendSuccessResponse = (
  response: Response,
  message: string,
  data = {},
  count?: number
) => {
  if (!count) {
    return response.json({
      status: 'success',
      message: message,
      data: data,
    })
  } else {
    return response.json({
      status: 'success',
      message: message,
      count,
      data: data,
    })
  }
}

export function sendErrorResponse(
  response: Response,
  code: number,
  message: string,
  data = {},
  customCode?: number
) {
  return response.status(code).json({
    status: 'error',
    code: customCode,
    message: message,
    data: data,
  })
}

export const getTokenRes = (token: AccessToken) => {
  return {
    type: 'Bearer',
    token: token.value!.release(),
  }
}

export const lowerCase = (item: string) => item.toLowerCase()

export const getExpirationTime = (): number => {
  const currentTimestampMs: number = Date.now()
  const expirationTimestampSec: number = Math.floor(currentTimestampMs / 1000) + 2 * 60 * 60
  return expirationTimestampSec
}

interface EFormat {
  code?: number
  error: Error
  source: string
  message?: string
}

export const sendServerErrorResponse = async (response: Response, er: EFormat) => {
  return response.status(er.code || 500).json({
    status: 'error',
    code: er.code,
    message: er.message ? er.message : er.error.message,
  })
}

export const generateRandomInvoiceNumber = (length: number): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length)
    result += characters.charAt(randomIndex)
  }
  return result
}

export const formatTimestamp = (timestamp: string | null): string | null => {
  if (timestamp) {
    const date = new Date(timestamp)
    const options: DateTimeFormatOptions = { year: 'numeric', month: 'short', day: '2-digit' }
    return date.toLocaleDateString('en-US', options)
  } else {
    return null
  }
}

export const hasDateExpired = (dateString: string) => {
  const givenDate = DateTime.fromISO(dateString, { zone: 'utc' })
  const now = DateTime.utc()
  return givenDate < now
}

export const generateVerificationCode = () => {
  return Math.floor(Math.random() * (999999 - 111111 + 1)) + 111111
}

export const generateVerificationToken = (length: number = 32): string => {
  const buffer = randomBytes(length)
  return buffer.toString('base64url')
}
