import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'clients'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('SET NULL') // Foreign key to users
      table.string('company').nullable()
      table.string('address').nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')

      /*
      
     adonis make:migration create_clients_table 
}
      
      
      */
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
