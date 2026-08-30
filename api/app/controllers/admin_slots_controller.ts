import User from '#models/user'
import Servico from '#models/servico'
import { resolverTotaisServico } from '#helpers/servico_incrementos'
import SlotEngineService from '#services/slot_engine_service'
import type { HttpContext } from '@adonisjs/core/http'

const slotEngine = new SlotEngineService()

function parseIncrementoIds(raw: unknown): string[] {
  if (raw === undefined || raw === null || raw === '') return []
  if (Array.isArray(raw)) return raw.map(String).filter(Boolean)
  if (typeof raw === 'string') {
    return raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  }
  return []
}

export default class AdminSlotsController {
  /**
   * Slots para agendamento manual (BE-9): mesmos turnos da disponibilidade; ignora bloqueio de agenda;
   * na grade só remove choque com CONFIRMADOS (PENDENTE não bloqueia).
   */
  async index({ params, request, authJwt, response }: HttpContext) {
    const user = await findUserAndAuthorize(params.slug, authJwt, response)
    if (!user) return

    const data = request.input('data') as string | undefined
    const servicoId = request.input('servicoId') as string | undefined
    if (!data || !servicoId) {
      return response.badRequest({ message: 'Parâmetros data e servicoId são obrigatórios' })
    }

    const servico = await Servico.query()
      .where('id', servicoId)
      .where('user_id', user.id)
      .where('ativo', true)
      .preload('incrementos')
      .first()

    if (!servico) return response.notFound({ message: 'Serviço não encontrado' })

    const resolved = resolverTotaisServico(
      servico,
      servico.incrementos ?? [],
      parseIncrementoIds(request.input('incremento_ids'))
    )
    if (!resolved.ok) {
      return response.unprocessableEntity({ message: resolved.message })
    }

    const slots = await slotEngine.computeSlots({
      user,
      data,
      servico,
      mode: 'manual',
      duracaoMinutos: resolved.totais.duracao_minutos,
    })
    return response.ok(slots.map((s) => s.hora))
  }
}

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
