import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'campaigns'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('title').notNullable();
      table.string('description').nullable();
      table.date('start_date').nullable();
      table.date('end_date').nullable();
      table.enum('status', ['draft', 'active', 'completed']).defaultTo('draft');
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}