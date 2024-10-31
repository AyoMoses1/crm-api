import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'campaigns'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.enum('channel', ['whatsapp', 'email', 'sms']).defaultTo('email')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
