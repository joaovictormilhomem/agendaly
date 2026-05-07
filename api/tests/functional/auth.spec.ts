import { test } from '@japa/runner'
import User from '#models/user'
import AuthSession from '#models/auth_session'
import hash from '@adonisjs/core/services/hash'
import JwtService from '#services/jwt_service'
import { DateTime } from 'luxon'
import crypto from 'node:crypto'

test.group('Auth /api/login', () => {
  test('login válido retorna token com claims', async ({ client, assert }) => {
    const user = await User.create({
      id: crypto.randomUUID(),
      name: 'Maria',
      email: 'maria@exemplo.com',
      passwordHash: await hash.make('123456'),
      slug: 'maria-estetica',
      role: 'PROFISSIONAL',
    })

    const res = await client.post('/api/login').json({ email: user.email, password: '123456' })
    res.assertStatus(200)

    const body = res.body()
    assert.isString(body.token)
    assert.isString(body.refresh_token)

    const decoded = await JwtService.verifyAccessToken(body.token)
    assert.equal(decoded.role, 'PROFISSIONAL')
    assert.equal(decoded.user_id, user.id)
    assert.equal(decoded.slug, user.slug)
    assert.equal(decoded.email, user.email)
    assert.equal(decoded.name, user.name)
  })

  test('credencial inválida retorna 401', async ({ client }) => {
    await User.create({
      id: crypto.randomUUID(),
      name: 'Admin',
      email: 'admin@exemplo.com',
      passwordHash: await hash.make('123456'),
      slug: 'admin',
      role: 'SUPERADMIN',
    })

    const res = await client.post('/api/login').json({ email: 'admin@exemplo.com', password: 'errada' })
    res.assertStatus(401)
  })

  test('token expirado é rejeitado', async ({ client }) => {
    const userId = crypto.randomUUID()

    await User.create({
      id: userId,
      name: 'João',
      email: 'joao@exemplo.com',
      passwordHash: await hash.make('123456'),
      slug: 'joao',
      role: 'PROFISSIONAL',
    })

    const sessionId = crypto.randomUUID()
    await AuthSession.create({
      id: sessionId,
      userId,
      lastActivityAt: DateTime.utc(),
      revokedAt: null,
    })

    const token = await JwtService.signAccessToken(
      {
        role: 'PROFISSIONAL',
        user_id: userId,
        slug: 'joao',
        email: 'joao@exemplo.com',
        name: 'João',
        sid: sessionId,
      },
      '1s'
    )

    await new Promise((r) => setTimeout(r, 1100))

    const res = await client.get('/api/me').header('Authorization', `Bearer ${token}`)
    res.assertStatus(401)
  })

  test('sessão expira após 30 min de inatividade', async ({ client }) => {
    const userId = crypto.randomUUID()

    await User.create({
      id: userId,
      name: 'Ana',
      email: 'ana@exemplo.com',
      passwordHash: await hash.make('123456'),
      slug: 'ana',
      role: 'PROFISSIONAL',
    })

    const sessionId = crypto.randomUUID()
    await AuthSession.create({
      id: sessionId,
      userId,
      lastActivityAt: DateTime.utc().minus({ minutes: 31 }),
      revokedAt: null,
    })

    const token = await JwtService.signAccessToken({
      role: 'PROFISSIONAL',
      user_id: userId,
      slug: 'ana',
      email: 'ana@exemplo.com',
      name: 'Ana',
      sid: sessionId,
    })

    const res = await client.get('/api/me').header('Authorization', `Bearer ${token}`)
    res.assertStatus(401)
  })
})

