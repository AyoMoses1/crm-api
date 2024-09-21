import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, hasOne } from '@adonisjs/lucid/orm'
import Role from './role.js'
import type { HasMany, HasOne } from '@adonisjs/lucid/types/relations'
import Permission from './permission.js'

export default class RolePermission extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare permission_id: number

  @column()
  declare role_id: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasOne(() => Role, { foreignKey: 'role_id', localKey: 'role' })
  declare role: HasOne<typeof Role>

  @hasMany(() => Permission, { foreignKey: 'id', localKey: 'permission_id' })
  declare permissions: HasMany<typeof Permission>
}
