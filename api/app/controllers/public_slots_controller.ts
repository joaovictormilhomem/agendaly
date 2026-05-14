import User from '#models/user'
import Servico from '#models/servico'
import SlotEngineService from '#services/slot_engine_service'
import type { HttpContext } from '@adonisjs/core/http'

const slotEngine = new SlotEngineService()

export default class PublicSlotsController {
  /**
   * BE-6: GET /api/public/:slug/slots?data=&servicoId=
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
      .first()

    if (!servico) return response.notFound({ message: 'Serviço não encontrado' })

    const slots = await slotEngine.computeSlots({ user, data, servico, mode: 'public' })
    return response.ok(slots)
  }
}
