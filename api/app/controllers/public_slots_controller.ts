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

export default class PublicSlotsController {
  /**
   * BE-6: GET /api/public/:slug/slots?data=&servicoId=&incremento_ids=
   */
  async index({ params, request, response }: HttpContext) {
    const user = (await User.query().where('slug', params.slug).first()) as User | null
    if (!user) return response.notFound({ message: 'Profissional não encontrada' })

    const data =
      (request.input('data') as string | undefined) ?? (request.input('date') as string | undefined)
    const servicoId = request.input('servicoId') as string | undefined
    if (!data || !servicoId) {
      return response.badRequest({ message: 'Parâmetros data (ou date) e servicoId são obrigatórios' })
    }

    const servico = await Servico.query()
      .where('id', servicoId)
      .where('user_id', user.id)
      .where('ativo', true)
      .preload('incrementos', (q) => q.preload('adicionais'))
      .first()

    if (!servico) return response.notFound({ message: 'Serviço não encontrado' })

    const resolved = resolverTotaisServico(
      servico,
      servico.incrementos ?? [],
      parseIncrementoIds(request.input('incremento_ids')),
      parseIncrementoIds(request.input('incremento_adicional_ids'))
    )
    if (!resolved.ok) {
      return response.unprocessableEntity({ message: resolved.message })
    }

    const slots = await slotEngine.computeSlots({
      user,
      data,
      servico,
      mode: 'public',
      duracaoMinutos: resolved.totais.duracao_minutos,
    })
    return response.ok(slots)
  }
}
