import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'invoices'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('client_id').unsigned().references('id').inTable('clients').onDelete('CASCADE');
      table.string('invoice_number').unique().notNullable();
      table.decimal('amount', 10, 2).notNullable();
      table.enum('status', ['draft', 'sent', 'paid', 'overdue']).defaultTo('draft');
      table.date('due_date').nullable();
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}