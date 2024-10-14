import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'payments'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('client_id').unsigned().references('id').inTable('clients').onDelete('CASCADE')
      table.integer('invoice_id').unsigned().references('id').inTable('invoices').onDelete('CASCADE')
      table.decimal('amount', 10, 2).notNullable() // Example: 10 digits total, 2 decimal places
      table.date('payment_date').notNullable()
      table.string('payment_method').nullable()
      table.enum('status', ['pending', 'completed', 'failed']).defaultTo('pending')
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
