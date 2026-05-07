import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class SuperadminOnlyMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const role = ctx.authJwt?.claims.role
    if (role !== 'SUPERADMIN') {
      return ctx.response.forbidden({ message: 'Acesso restrito a SUPERADMIN' })
    }

    return next()
  }
}

