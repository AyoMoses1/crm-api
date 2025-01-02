import Role from '#models/role'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    await Role.createMany([
      {
        name: 'super_admin',
        description: 'Has complete system access and control',
      },
      {
        name: 'admin',
        description: 'Has administrative access with some restrictions',
      },
      {
        name: 'manager',
        description: 'Can manage users and view system data',
      },
      {
        name: 'staff',
        description: 'Regular staff member with basic access',
      },
      {
        name: 'user',
        description: 'Basic user with limited access',
      },
    ])
  }
}
