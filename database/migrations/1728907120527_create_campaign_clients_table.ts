import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'campaign_clients'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table
        .integer('campaign_id')
        .unsigned()
        .references('id')
        .inTable('campaigns')
        .onDelete('CASCADE')
      table.integer('client_id').unsigned().references('id').inTable('clients').onDelete('CASCADE')
      table.primary(['campaign_id', 'client_id'])
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
