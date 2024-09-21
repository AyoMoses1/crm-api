import Role from '#models/role'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    await Role.createMany([
      {
        name: 'customer',
        description: 'Regular user who can book hotels',
      },
      {
        name: 'agent',
        description: 'Agent who can list properties and manage bookings',
      },
      {
        name: 'admin',
        description: 'Administrator with access to manage the platform',
      },
      {
        name: 'super_admin',
        description: 'Super administrator with full control over the system',
      },
    ])
  }
}
