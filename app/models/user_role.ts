import { DateTime } from 'luxon'
import { BaseModel, column, hasOne } from '@adonisjs/lucid/orm'
import Role from './role.js'
import type { HasOne } from '@adonisjs/lucid/types/relations'
import User from './user.js'

export default class UserRole extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare user_id: number

  @column()
  declare role_id: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @hasOne(() => Role, { foreignKey: 'role_id', localKey: 'role' })
  declare role: HasOne<typeof Role>

  @hasOne(() => User, { foreignKey: 'id', localKey: 'user_id' })
  declare user: HasOne<typeof User>
}
