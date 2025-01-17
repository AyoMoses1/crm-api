import { BaseSchema } from '@adonisjs/lucid/schema'

export default class Users extends BaseSchema {
  protected tableName = 'users'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('password', 255).nullable()
      table.string('first_name', 100).notNullable()
      table.string('last_name', 100).notNullable()
      table.string('email', 100).notNullable().unique()
      table.string('phone_number', 20).nullable()
      table.boolean('is_active').defaultTo(true)
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
