import { DateTime } from 'luxon'
import { BaseModel, column, manyToMany } from '@adonisjs/lucid/orm'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'
import Client from './client.js'

export default class Campaign extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare title: string

  @column()
  declare description: string | null

  @column.date()
  declare start_date: DateTime | null

  @column.date()
  declare end_date: DateTime | null

  @column()
  declare status: 'draft' | 'active' | 'completed'

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @manyToMany(() => Client, {
    pivotTable: 'campaign_clients',
  })
  declare clients: ManyToMany<typeof Client>
}
