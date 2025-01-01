import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Service from '#models/service'

export default class extends BaseSeeder {
  async run() {
    await Service.createMany([
      {
        name: 'Logo Design',
        description: 'Professional custom logo design with multiple concepts and revisions',
        price: 500.0,
        status: 'enabled',
      },
      {
        name: 'Brand Strategy',
        description:
          'Complete brand strategy development including positioning, voice, and guidelines',
        price: 2000.0,
        status: 'enabled',
      },
      {
        name: 'Brand Guidelines',
        description:
          'Comprehensive brand style guide including typography, colors, and usage rules',
        price: 1200.0,
        status: 'enabled',
      },
      {
        name: 'Business Card Design',
        description: 'Custom business card design with print-ready files',
        price: 150.0,
        status: 'enabled',
      },
      {
        name: 'Social Media Kit',
        description: 'Design templates for various social media platforms',
        price: 600.0,
        status: 'enabled',
      },
      {
        name: 'Website Design',
        description: 'Custom website design with user experience optimization',
        price: 3000.0,
        status: 'enabled',
      },
      {
        name: 'UI/UX Design',
        description: 'User interface and experience design for digital products',
        price: 2500.0,
        status: 'enabled',
      },
      {
        name: 'Package Design',
        description: 'Custom product packaging design and mockups',
        price: 1500.0,
        status: 'enabled',
      },
      {
        name: 'Brand Photography',
        description: 'Professional photography session for brand assets',
        price: 1200.0,
        status: 'enabled',
      },
      {
        name: 'Video Production',
        description: 'Professional brand video creation and editing',
        price: 3500.0,
        status: 'enabled',
      },
      {
        name: 'Brand Audit',
        description: 'Comprehensive analysis of current brand presence and strategy',
        price: 1500.0,
        status: 'enabled',
      },
      {
        name: 'Marketing Strategy',
        description: 'Development of comprehensive marketing plan and strategy',
        price: 2500.0,
        status: 'enabled',
      },
    ])
  }
}
