import User from '#models/user'
import Servico from '#models/servico'
import SlotEngineService from '#services/slot_engine_service'
import type { HttpContext } from '@adonisjs/core/http'

const slotEngine = new SlotEngineService()

export default class AdminSlotsController {
  /**
   * Slots para agendamento manual (BE-9): ignora expediente/bloqueio; só conflita com CONFIRMADOS no motor.
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
      .first()

    if (!servico) return response.notFound({ message: 'Serviço não encontrado' })

    const slots = await slotEngine.computeSlots({ user, data, servico, mode: 'manual' })
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
