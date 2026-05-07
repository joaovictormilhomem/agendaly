import env from '#start/env'
import { jwtVerify, SignJWT } from 'jose'

export type AccessTokenClaims = {
  role: 'SUPERADMIN' | 'PROFISSIONAL'
  user_id: string
  slug: string
  email: string
  name: string
  sid: string
}

const accessKey = () => new TextEncoder().encode(env.get('JWT_ACCESS_SECRET').release())

class JwtService {
  async signAccessToken(claims: AccessTokenClaims, expiresIn: string = '7d') {
    return await new SignJWT({
      role: claims.role,
      user_id: claims.user_id,
      slug: claims.slug,
      email: claims.email,
      name: claims.name,
      sid: claims.sid,
    })
      .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
      .setIssuedAt()
      .setExpirationTime(expiresIn)
      .setSubject(claims.user_id)
      .sign(accessKey())
  }

  async verifyAccessToken(token: string): Promise<AccessTokenClaims> {
    const { payload } = await jwtVerify(token, accessKey())

    const role = payload.role
    const userId = payload.user_id
    const slug = payload.slug
    const email = payload.email
    const name = payload.name
    const sid = payload.sid

    if (role !== 'SUPERADMIN' && role !== 'PROFISSIONAL') {
      throw new Error('Invalid role claim')
    }
    if (
      typeof userId !== 'string' ||
      typeof slug !== 'string' ||
      typeof email !== 'string' ||
      typeof name !== 'string' ||
      typeof sid !== 'string'
    ) {
      throw new Error('Invalid access token claims')
    }

    return { role, user_id: userId, slug, email, name, sid }
  }
}

export default new JwtService()

