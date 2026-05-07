import AuthRefreshToken from '#models/auth_refresh_token'
import AuthSession from '#models/auth_session'
import User from '#models/user'
import JwtService from '#services/jwt_service'
import RefreshTokenService from '#services/refresh_token_service'
import hash from '@adonisjs/core/services/hash'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import crypto from 'node:crypto'
import { loginValidator, logoutValidator, refreshValidator } from '#validators/auth'

export default class AuthController {
  async login({ request, response }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)

    const user = (await (User as any).query().where('email', email).first()) as User | null
    if (!user) {
      return response.unauthorized({ message: 'Credenciais inválidas' })
    }

    const ok = await hash.verify(user.passwordHash, password)
    if (!ok) {
      return response.unauthorized({ message: 'Credenciais inválidas' })
    }

    const sessionId = crypto.randomUUID()
    const now = DateTime.utc()
    await AuthSession.create({
      id: sessionId,
      userId: user.id,
      lastActivityAt: now,
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

    const refreshToken = RefreshTokenService.createOpaqueToken()
    await RefreshTokenService.persist({
      id: crypto.randomUUID(),
      sessionId,
      userId: user.id,
      token: refreshToken,
      expiresAt: now.plus({ days: 7 }),
    })

    return response.ok({
      token,
      refresh_token: refreshToken,
    })
  }

  async refresh({ request, response }: HttpContext) {
    const { refresh_token } = await request.validateUsing(refreshValidator)

    const current = await RefreshTokenService.findValidByToken(refresh_token)
    if (!current) {
      return response.unauthorized({ message: 'Refresh token inválido' })
    }

    const session = await AuthSession.find(current.sessionId)
    if (!session || session.revokedAt) {
      return response.unauthorized({ message: 'Sessão inválida' })
    }

    const user = (await (User as any).find(current.userId)) as User | null
    if (!user) {
      return response.unauthorized({ message: 'Usuário não encontrado' })
    }

    // rotate token
    const now = DateTime.utc()
    const newRefreshToken = RefreshTokenService.createOpaqueToken()
    const newId = crypto.randomUUID()

    current.revokedAt = now
    current.replacedBy = newId
    await current.save()

    await RefreshTokenService.persist({
      id: newId,
      sessionId: current.sessionId,
      userId: current.userId,
      token: newRefreshToken,
      expiresAt: now.plus({ days: 7 }),
    })

    const token = await JwtService.signAccessToken({
      role: user.role,
      user_id: user.id,
      slug: user.slug,
      email: user.email,
      name: user.name,
      sid: session.id,
    })

    return response.ok({
      token,
      refresh_token: newRefreshToken,
    })
  }

  async logout({ request, response, authJwt }: HttpContext) {
    const { refresh_token } = await request.validateUsing(logoutValidator)

    if (authJwt?.session) {
      authJwt.session.revokedAt = DateTime.utc()
      await authJwt.session.save()
    }

    if (refresh_token) {
      const tokenHash = RefreshTokenService.hashToken(refresh_token)
      const refreshRow = await AuthRefreshToken.query().where('token_hash', tokenHash).first()
      if (refreshRow && !refreshRow.revokedAt) {
        refreshRow.revokedAt = DateTime.utc()
        await refreshRow.save()
      }
    }

    return response.ok({ message: 'Logout efetuado' })
  }
}

