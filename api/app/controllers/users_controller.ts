import User from '#models/user'
import { createUserValidator } from '#validators/user'
import hash from '@adonisjs/core/services/hash'
import type { HttpContext } from '@adonisjs/core/http'
import crypto from 'node:crypto'

export default class UsersController {
  async store({ request, response }: HttpContext) {
    const { name, email, password, slug, role } = await request.validateUsing(createUserValidator)

    const user = await User.create({
      id: crypto.randomUUID(),
      name,
      email,
      passwordHash: await hash.make(password),
      slug,
      role,
    })

    return response.created({
      id: user.id,
      name: user.name,
      email: user.email,
      slug: user.slug,
      role: user.role,
      created_at: user.createdAt,
    })
  }
}

