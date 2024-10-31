import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = ['users', 'clients']

  async up() {
    this.schema.alterTable(this.tableName[1], (table) => {
      table.string('avatar')
    })
    this.schema.alterTable(this.tableName[0], (table) => {
      table.string('avatar')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName[0])
    this.schema.dropTable(this.tableName[1])
  }
}
