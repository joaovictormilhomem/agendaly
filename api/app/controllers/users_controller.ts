import AuthSession from '#models/auth_session'
import User from '#models/user'
import JwtService from '#services/jwt_service'
import { createUserValidator } from '#validators/user'
import hash from '@adonisjs/core/services/hash'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import crypto from 'node:crypto'

export default class UsersController {
  async index({ response }: HttpContext) {
    const users = await (User as any).query().where('role', 'PROFISSIONAL').orderBy('created_at', 'asc')
    return response.ok(
      users.map((u: User) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        slug: u.slug,
        role: u.role,
        created_at: u.createdAt,
      }))
    )
  }

  async impersonate({ params, response }: HttpContext) {
    const user = await (User as any).query().where('slug', params.slug).where('role', 'PROFISSIONAL').first() as User | null
    if (!user) {
      return response.notFound({ message: 'Profissional não encontrada' })
    }

    const sessionId = crypto.randomUUID()
    await AuthSession.create({
      id: sessionId,
      userId: user.id,
      lastActivityAt: DateTime.utc(),
      revokedAt: null,
    })

    const token = await JwtService.signAccessToken({
      role: user.role,
      user_id: user.id,
      slug: user.slug,
      email: user.email,
      name: user.name,
      sid: sessionId,
    })

    return response.ok({ token })
  }

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
