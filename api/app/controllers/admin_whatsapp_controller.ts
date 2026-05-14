import User from '#models/user'
import WhatsappBridgeService from '#services/whatsapp_bridge_service'
import type { HttpContext } from '@adonisjs/core/http'

const bridge = new WhatsappBridgeService()

async function findUserAndAuthorize(
  slug: string,
  authJwt: HttpContext['authJwt'],
  response: HttpContext['response']
) {
  const user = (await User.query().where('slug', slug).first()) as User | null
  if (!user) {
    response.notFound({ message: 'Profissional não encontrada' })
    return null
  }
  if (authJwt!.user.slug !== user.slug && authJwt!.user.role !== 'SUPERADMIN') {
    response.forbidden({ message: 'Acesso negado' })
    return null
  }
  return user
}

export default class AdminWhatsappController {
  /**
   * GET /api/admin/:slug/whatsapp/status
   */
  async status({ params, authJwt, response }: HttpContext) {
    const user = await findUserAndAuthorize(params.slug, authJwt, response)
    if (!user) return

    if (!bridge.isEnabled()) {
      return response.ok({
        habilitado_no_servidor: false,
        state: 'disabled',
        qr_data_url: null as string | null,
        error: null as string | null,
      })
    }

    const s = await bridge.getSessionStatus(user.id)
    return response.ok({
      habilitado_no_servidor: true,
      state: s!.state,
      qr_data_url: s!.qr_data_url,
      error: s!.error,
    })
  }

  /**
   * POST /api/admin/:slug/whatsapp/conectar
   */
  async conectar({ params, authJwt, response }: HttpContext) {
    const user = await findUserAndAuthorize(params.slug, authJwt, response)
    if (!user) return

    if (!bridge.isEnabled()) {
      return response.badRequest({
        message: 'WhatsApp não está configurado no servidor (WHATSAPP_BRIDGE_URL / SECRET).',
      })
    }

    try {
      const s = await bridge.startSession(user.id)
      return response.ok({
        state: s!.state,
        qr_data_url: s!.qr_data_url,
        error: s!.error,
      })
    } catch (e) {
      return response.badRequest({
        message: e instanceof Error ? e.message : 'Falha ao iniciar sessão',
      })
    }
  }

  /**
   * POST /api/admin/:slug/whatsapp/desconectar
   */
  async desconectar({ params, authJwt, response }: HttpContext) {
    const user = await findUserAndAuthorize(params.slug, authJwt, response)
    if (!user) return

    if (!bridge.isEnabled()) {
      return response.badRequest({ message: 'Integração não configurada.' })
    }

    try {
      await bridge.logoutSession(user.id)
      return response.ok({ ok: true })
    } catch (e) {
      return response.badRequest({
        message: e instanceof Error ? e.message : 'Falha ao desconectar',
      })
    }
  }
}
