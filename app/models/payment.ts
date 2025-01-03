import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Client from './client.js'
import Invoice from './invoice.js'

export default class Payment extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare client_id: number

  @column()
  declare invoice_id: number

  @column()
  declare amount: number

  @column.date()
  declare payment_date: DateTime

  @column()
  declare payment_method: string | null

  @column()
  declare paystack_reference: string

  @column()
  declare paystack_transaction_id: string

  @column()
  declare payment_channel: string

  @column()
  declare status: 'pending' | 'completed' | 'failed'

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Client)
  declare client: BelongsTo<typeof Client>

  @belongsTo(() => Invoice)
  declare invoice: BelongsTo<typeof Invoice>
}
