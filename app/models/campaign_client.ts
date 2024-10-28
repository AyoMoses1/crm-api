import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import Campaign from './campaign.js'
import Client from './client.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class CampaignClient extends BaseModel {
  @column({ isPrimary: true })
  declare campaignId: number

  @column({ isPrimary: true })
  declare clientId: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Campaign)
  declare campaign: BelongsTo<typeof Campaign>

  @belongsTo(() => Client)
  declare client: BelongsTo<typeof Client>
}
