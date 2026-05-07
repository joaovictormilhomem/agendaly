import AuthSession from '#models/auth_session'
import User from '#models/user'
import JwtService, { type AccessTokenClaims } from '#services/jwt_service'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { DateTime } from 'luxon'

declare module '@adonisjs/core/http' {
  export interface HttpContext {
    authJwt?: {
      user: User
      session: AuthSession
      claims: AccessTokenClaims
    }
  }
}

export default class JwtAuthMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const authHeader = ctx.request.header('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return ctx.response.unauthorized({ message: 'Missing Bearer token' })
    }

    const token = authHeader.slice('Bearer '.length).trim()
    let claims: AccessTokenClaims
    try {
      claims = await JwtService.verifyAccessToken(token)
    } catch {
      return ctx.response.unauthorized({ message: 'Invalid or expired token' })
    }

    const session = await AuthSession.find(claims.sid)
    if (!session || session.revokedAt) {
      return ctx.response.unauthorized({ message: 'Session revoked' })
    }

    const now = DateTime.utc()
    const lastActivity = session.lastActivityAt
    const minutesInactive = lastActivity ? now.diff(lastActivity, 'minutes').minutes : Number.POSITIVE_INFINITY

    if (minutesInactive > 30) {
      session.revokedAt = now
      await session.save()
      return ctx.response.unauthorized({ message: 'Session expired by inactivity' })
    }

    const user = await User.find(claims.user_id)
    if (!user) {
      return ctx.response.unauthorized({ message: 'User not found' })
    }

    session.lastActivityAt = now
    await session.save()

    ctx.authJwt = { user, session, claims }
    return next()
  }
}

