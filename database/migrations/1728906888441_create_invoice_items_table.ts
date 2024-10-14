import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'invoice_items'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('invoice_id')
        .unsigned()
        .references('id')
        .inTable('invoices')
        .onDelete('CASCADE')
      table
        .integer('service_id')
        .unsigned()
        .references('id')
        .inTable('services')
        .onDelete('CASCADE') // Allow null if service is deleted
      table.string('description').notNullable()
      table.decimal('price', 10, 2).notNullable()
      table.integer('quantity').unsigned().defaultTo(1)
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
