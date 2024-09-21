import { BaseSchema } from '@adonisjs/lucid/schema'

export default class PasswordResets extends BaseSchema {
  protected tableName = 'password_resets'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.string('reset_token', 255).notNullable().unique()
      table.timestamp('expires_at', { useTz: true }).notNullable()
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.boolean('used').notNullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
