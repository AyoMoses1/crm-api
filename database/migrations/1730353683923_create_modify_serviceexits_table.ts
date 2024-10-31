import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'services'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.enum('status', ['enabled', 'disabled']).defaultTo('enabled')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
