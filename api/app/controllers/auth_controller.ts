import AuthRefreshToken from '#models/auth_refresh_token'
import AuthSession from '#models/auth_session'
import User from '#models/user'
import JwtService from '#services/jwt_service'
import RefreshTokenService from '#services/refresh_token_service'
import hash from '@adonisjs/core/services/hash'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import crypto from 'node:crypto'
import { changePasswordValidator, loginValidator } from '#validators/auth'

export default class AuthController {
  private setRefreshCookie(response: HttpContext['response'], token: string) {
    response.cookie('refresh_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    })
  }

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

    this.setRefreshCookie(response, refreshToken)
    return response.ok({ token })
  }

  async refresh({ request, response }: HttpContext) {
    const refreshToken = request.cookie('refresh_token')
    if (!refreshToken) {
      return response.unauthorized({ message: 'Refresh token ausente' })
    }

    const current = await RefreshTokenService.findValidByToken(refreshToken)
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

    this.setRefreshCookie(response, newRefreshToken)
    return response.ok({ token })
  }

  async changePassword({ request, response, authJwt }: HttpContext) {
    if (!authJwt) return response.unauthorized()

    const { senha_atual, nova_senha } = await request.validateUsing(changePasswordValidator)

    const user = authJwt.user

    const ok = await hash.verify(user.passwordHash, senha_atual)
    if (!ok) return response.unprocessableEntity({ message: 'Senha atual incorreta' })

    user.passwordHash = await hash.make(nova_senha)
    await user.save()

    return response.ok({ message: 'Senha alterada com sucesso' })
  }

  async logout({ request, response, authJwt }: HttpContext) {
    if (authJwt?.session) {
      authJwt.session.revokedAt = DateTime.utc()
      await authJwt.session.save()
    }

    const refreshToken = request.cookie('refresh_token')
    if (refreshToken) {
      const tokenHash = RefreshTokenService.hashToken(refreshToken)
      const refreshRow = await AuthRefreshToken.query().where('token_hash', tokenHash).first()
      if (refreshRow && !refreshRow.revokedAt) {
        refreshRow.revokedAt = DateTime.utc()
        await refreshRow.save()
      }
    }

    response.clearCookie('refresh_token', { path: '/' })
    return response.ok({ message: 'Logout efetuado' })
  }
}

