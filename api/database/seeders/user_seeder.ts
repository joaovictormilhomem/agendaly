import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import hash from '@adonisjs/core/services/hash'
import crypto from 'node:crypto'

export default class extends BaseSeeder {
  async run() {
    await User.updateOrCreateMany('email', [
      {
        id: crypto.randomUUID(),
        name: 'Super Admin',
        email: 'superadmin@agendaly.com',
        passwordHash: await hash.make('admin123456'),
        slug: 'superadmin',
        role: 'SUPERADMIN',
      },
      {
        id: crypto.randomUUID(),
        name: 'Professional Demo',
        email: 'prof@agendaly.com',
        passwordHash: await hash.make('prof123456'),
        slug: 'prof-demo',
        role: 'PROFISSIONAL',
      },
    ])
  }
}