import User from '#models/user'
import WhatsappMensagem from '#models/whatsapp_mensagem'
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

  /**
   * GET /api/admin/:slug/whatsapp/mensagens
   */
  async mensagens({ params, authJwt, request, response }: HttpContext) {
    const user = await findUserAndAuthorize(params.slug, authJwt, response)
    if (!user) return

    const pageRaw = Number(request.input('page', 1))
    const perPageRaw = Number(request.input('per_page', 20))
    const page = Number.isFinite(pageRaw) && pageRaw >= 1 ? Math.floor(pageRaw) : 1
    const perPage = Number.isFinite(perPageRaw)
      ? Math.min(50, Math.max(1, Math.floor(perPageRaw)))
      : 20

    const paginator = await WhatsappMensagem.query()
      .where('user_id', user.id)
      .preload('agendamento')
      .orderBy('created_at', 'desc')
      .paginate(page, perPage)

    const meta = paginator.getMeta()

    return response.ok({
      mensagens: paginator.all().map((mensagem) => ({
        id: mensagem.id,
        agendamento_id: mensagem.agendamentoId,
        cliente_nome: mensagem.agendamento?.clienteNome ?? '',
        contexto: mensagem.contexto,
        destinatario: mensagem.destinatario,
        corpo: mensagem.corpo,
        status: mensagem.status,
        erro: mensagem.erro,
        chat_id: mensagem.chatId,
        message_id: mensagem.messageId,
        created_at: mensagem.createdAt.toISO(),
        updated_at: mensagem.updatedAt?.toISO() ?? null,
      })),
      meta: {
        total: meta.total,
        page: meta.currentPage,
        per_page: meta.perPage,
        last_page: meta.lastPage,
      },
    })
  }
}
