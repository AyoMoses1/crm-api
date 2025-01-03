import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'payments'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('paystack_reference').notNullable()
      table.string('paystack_transaction_id').notNullable()
      table.string('payment_channel').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
