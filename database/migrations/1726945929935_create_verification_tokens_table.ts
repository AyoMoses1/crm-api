import { BaseSchema } from '@adonisjs/lucid/schema'

export default class VerificationTokens extends BaseSchema {
  protected tableName = 'verification_tokens'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.string('token', 255).notNullable().unique()
      table.timestamp('expires_at', { useTz: true }).notNullable()
      table.boolean('used').defaultTo(false)
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
