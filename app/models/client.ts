import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import Appointment from './appointment.js'
import Invoice from './invoice.js'
import Payment from './payment.js'

export default class Client extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare first_name: string

  @column()
  declare last_name: string

  @column()
  declare phone_number: string

  @column()
  declare email: string

  @column()
  declare company: string | null

  @column()
  declare country: string | null

  @column()
  declare state: string | null

  @column()
  declare address: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @hasMany(() => Appointment)
  declare appointments: HasMany<typeof Appointment>

  @hasMany(() => Invoice)
  declare invoices: HasMany<typeof Invoice>

  @hasMany(() => Payment)
  declare payments: HasMany<typeof Payment>
}
