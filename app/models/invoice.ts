import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Client from './client.js'
import InvoiceItem from './invoice_item.js'
import Payment from './payment.js'

export default class Invoice extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare client_id: number

  @column()
  declare invoice_number: string

  @column()
  declare amount: number

  @column()
  declare status: 'draft' | 'sent' | 'paid' | 'overdue'

  @column.date()
  declare due_date: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Client)
  declare client: BelongsTo<typeof Client>

  @hasMany(() => InvoiceItem)
  declare items: HasMany<typeof InvoiceItem>

  @hasMany(() => Payment)
  declare payments: HasMany<typeof Payment>
}
