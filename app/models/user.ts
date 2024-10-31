import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column, hasMany, hasOne } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import Client from './client.js'
import Appointment from './appointment.js'
import type { HasMany, HasOne } from '@adonisjs/lucid/types/relations'
import UserRole from './user_role.js'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare first_name: string

  @column()
  declare last_name: string

  @column()
  declare phone_number: string

  @column()
  declare avatar: string | null

  @column()
  declare email: string

  @column()
  declare password: string

  @column()
  declare is_active: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  static accessTokens = DbAccessTokensProvider.forModel(User)

  @hasMany(() => Client, { foreignKey: 'id', localKey: 'client_id' })
  declare clients: HasMany<typeof Client>

  @hasOne(() => UserRole, { foreignKey: 'user_id', localKey: 'id' })
  declare role: HasOne<typeof UserRole>

  @hasMany(() => Appointment, { foreignKey: 'id', localKey: 'appointment_id' })
  declare appointments: HasMany<typeof Appointment>
}
