import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'campaigns'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('email_header', 255).nullable()
      table.string('email_sub_header', 255).nullable()
      table.string('image').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
