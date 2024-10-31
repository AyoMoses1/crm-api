import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { sendErrorResponse, sendSuccessResponse } from '#utils/index'
import Campaign from '#models/campaign'
import { DateTime } from 'luxon'
import { campaignPayloadValidator } from '#validators/campaign'
import logger from '@adonisjs/core/services/logger'
import { TransactionClientContract } from '@adonisjs/lucid/types/database'
import Client from '#models/client'
import { sendCampaignEmailToClient } from '#modules/user/index'

interface CampaignPayload {
  title: string
  description?: string
  start_date?: string
  end_date?: string
  status: 'draft' | 'active' | 'completed'
  image?: string
  email_header?: string
  email_sub_header?: string
  channel: 'email' | 'whatsapp' | 'sms'
  client_ids?: number[]
}

export const createCampaign = async (campaign: CampaignPayload, trx: any) => {
  try {
    const newCampaign = await Campaign.create(
      {
        title: campaign.title,
        description: campaign.description,
        start_date: campaign.start_date ? DateTime.fromISO(campaign.start_date) : null,
        end_date: campaign.end_date ? DateTime.fromISO(campaign.end_date) : null,
        status: campaign.status,
        image: campaign.image,
        email_header: campaign.email_header,
        email_sub_header: campaign.email_sub_header,
        channel: campaign.channel,
      },
      { client: trx }
    )

    if (campaign.client_ids && campaign.client_ids.length > 0) {
      await newCampaign.related('clients').attach(campaign.client_ids, trx)
    }

    return newCampaign
  } catch (error) {
    logger.error({ error })
    throw new Error(error)
  }
}

export const fetchAllCampaigns = async (page: number, limit: number) => {
  return await Campaign.query()
    .preload('clients', (query) => {
      query.select('id', 'first_name', 'last_name', 'email', 'phone_number')
    })
    .orderBy('created_at', 'desc')
    .paginate(page, limit)
}

export const fetchCampaignDetails = async (id: number, trx?: TransactionClientContract) => {
  const campaign = await Campaign.query({ client: trx })
    .where('id', id)
    .preload('clients', (query) => {
      query.select('id', 'first_name', 'last_name', 'email', 'phone_number')
    })
    .first()

  if (!campaign) {
    throw new Error('Campaign not found')
  }

  return campaign
}

export default class CampaignsController {
  async createCampaign({ request, response }: HttpContext) {
    await db.transaction(async (trx) => {
      try {
        // You'll need to create a validator for this
        const validatedPayload = await request.validateUsing(campaignPayloadValidator)

        const payload: CampaignPayload = {
          ...validatedPayload,
          start_date: validatedPayload.start_date.toISOString(),
          end_date: validatedPayload.end_date.toISOString(),
        }
        // Fetch clients based on client_ids in the campaign
        const clients = await Client.query()
          .whereIn('id', validatedPayload.client_ids)
          .select('email', 'id', 'first_name', 'last_name')

        const campaign = await createCampaign(payload, trx)

        if (campaign.$isPersisted) {
          for (const client of clients) {
            await sendCampaignEmailToClient(client, trx, validatedPayload)
          }
          return sendSuccessResponse(
            response,
            'Campaign created successfully',
            await fetchCampaignDetails(campaign.id, trx)
          )
        } else {
          return sendErrorResponse(response, 422, 'Campaign creation failed.')
        }
      } catch (error) {
        logger.error({ error })
        return sendErrorResponse(response, 500, error)
      }
    })
  }

  async getAllCampaigns({ request, response }: HttpContext) {
    try {
      const page = request.input('page', 1)
      const limit = request.input('limit', 10)

      const campaigns = await fetchAllCampaigns(page, limit)

      if (campaigns.length > 0) {
        return sendSuccessResponse(response, 'Campaigns fetched successfully', campaigns)
      } else {
        return sendErrorResponse(response, 404, 'No campaigns found.')
      }
    } catch (error) {
      return sendErrorResponse(response, 500, 'Failed to fetch campaigns')
    }
  }

  async getCampaignDetails({ params, response }: HttpContext) {
    try {
      const campaign = await fetchCampaignDetails(params.id)
      return sendSuccessResponse(response, 'Campaign details fetched successfully', campaign)
    } catch (error) {
      if (error.message === 'Campaign not found') {
        return sendErrorResponse(response, 404, 'Campaign not found')
      }
      return sendErrorResponse(response, 500, 'Failed to fetch campaign details')
    }
  }

  async updateCampaign({ params, request, response }: HttpContext) {
    try {
      const campaign = await Campaign.findOrFail(params.id)

      const payload = request.only([
        'title',
        'description',
        'start_date',
        'end_date',
        'status',
        'image',
        'email_header',
        'email_sub_header',
        'channel',
        'client_ids',
      ]) as CampaignPayload

      // Update campaign details
      campaign.merge({
        title: payload.title,
        description: payload.description,
        start_date: payload.start_date ? DateTime.fromISO(payload.start_date) : campaign.start_date,
        end_date: payload.end_date ? DateTime.fromISO(payload.end_date) : campaign.end_date,
        status: payload.status,
        image: payload.image,
        email_header: payload.email_header,
        email_sub_header: payload.email_sub_header,
        channel: payload.channel,
      })

      await campaign.save()

      // Update client associations if provided
      if (payload.client_ids) {
        await campaign.related('clients').sync(payload.client_ids)
      }

      return sendSuccessResponse(
        response,
        'Campaign updated successfully',
        await fetchCampaignDetails(campaign.id)
      )
    } catch (error) {
      if (error.message === 'E_ROW_NOT_FOUND: Row not found') {
        return sendErrorResponse(response, 404, 'Campaign not found')
      }
      return sendErrorResponse(response, 500, 'Failed to update campaign')
    }
  }

  async deleteCampaign({ params, response }: HttpContext) {
    await db.transaction(async (trx) => {
      try {
        const campaign = await Campaign.findOrFail(params.id)

        // Remove all client associations
        await campaign.related('clients').detach([], trx)

        // Delete the campaign
        await campaign.delete()

        return sendSuccessResponse(response, 'Campaign deleted successfully')
      } catch (error) {
        if (error.message === 'E_ROW_NOT_FOUND: Row not found') {
          return sendErrorResponse(response, 404, 'Campaign not found')
        }
        return sendErrorResponse(response, 500, 'Failed to delete campaign')
      }
    })
  }
}
