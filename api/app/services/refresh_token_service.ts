import AuthRefreshToken from '#models/auth_refresh_token'
import env from '#start/env'
import { DateTime } from 'luxon'
import crypto from 'node:crypto'

class RefreshTokenService {
  createOpaqueToken() {
    return crypto.randomBytes(48).toString('base64url')
  }

  hashToken(token: string) {
    const secret = env.get('JWT_REFRESH_SECRET').release()
    return crypto.createHmac('sha256', secret).update(token).digest('hex')
  }

  async persist(params: { id: string; sessionId: string; userId: string; token: string; expiresAt: DateTime }) {
    const tokenHash = this.hashToken(params.token)

    await AuthRefreshToken.create({
      id: params.id,
      sessionId: params.sessionId,
      userId: params.userId,
      tokenHash,
      expiresAt: params.expiresAt,
      revokedAt: null,
      replacedBy: null,
    })
  }

  async findValidByToken(token: string) {
    const tokenHash = this.hashToken(token)
    const now = DateTime.utc()

    return await AuthRefreshToken.query()
      .where('token_hash', tokenHash)
      .whereNull('revoked_at')
      .where('expires_at', '>', now.toSQL()!)
      .first()
  }
}

export default new RefreshTokenService()

