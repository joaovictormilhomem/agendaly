import Agendamento from '#models/agendamento'
import BookingAttempt from '#models/booking_attempt'
import Servico from '#models/servico'
import User from '#models/user'
import NotificacaoAgendamentoService from '#services/notificacao_agendamento_service'
import SlotEngineService, { invalidateSlotCacheForUser } from '#services/slot_engine_service'
import { publicAgendarValidator } from '#validators/agenda_public'
import db from '@adonisjs/lucid/services/db'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import crypto from 'node:crypto'

const slotEngine = new SlotEngineService()
const notificacao = new NotificacaoAgendamentoService()

class SlotConflictError extends Error {
  constructor(public sugestoes: string[]) {
    super('slot indisponível')
    this.name = 'SlotConflictError'
  }
}

export default class PublicBookingsController {
  /**
   * BE-7: POST /api/public/:slug/agendar
   */
  async store({ params, request, response }: HttpContext) {
    const user = (await User.query().where('slug', params.slug).first()) as User | null
    if (!user) return response.notFound({ message: 'Profissional não encontrada' })

    const body = await request.validateUsing(publicAgendarValidator)

    const servico = await Servico.query()
      .where('id', body.servicoId)
      .where('user_id', user.id)
      .where('ativo', true)
      .first()

    if (!servico) return response.notFound({ message: 'Serviço não encontrado' })

    const inicioUtc = DateTime.fromISO(body.slot_datetime, { setZone: true })
    if (!inicioUtc.isValid) {
      return response.badRequest({ message: 'slot_datetime inválido (use ISO 8601)' })
    }

    const fimUtc = inicioUtc.plus({ minutes: servico.duracaoMinutos })

    const logAttempt = async (resultado: string, detalhes?: string | null) => {
      await BookingAttempt.create({
        id: crypto.randomUUID(),
        userId: user.id,
        servicoId: servico.id,
        slotDatetime: inicioUtc,
        resultado,
        detalhes: detalhes ?? null,
      })
    }

    let created: Agendamento | null = null

    try {
      await db.transaction(async (trx) => {
        await User.query({ client: trx }).where('id', user.id).forUpdate().first()

        const ok = await slotEngine.podeReservarPublico({ user, servico, inicioUtc })
        if (!ok) {
          const sugestoes = await slotEngine.proximosSlotsLivres({
            user,
            servico,
            aposUtc: inicioUtc,
            limite: 3,
          })
          throw new SlotConflictError(sugestoes)
        }

        created = await Agendamento.create(
          {
            id: crypto.randomUUID(),
            userId: user.id,
            servicoId: servico.id,
            clienteNome: body.cliente_nome,
            clienteWhatsapp: body.cliente_whatsapp.replace(/\D/g, '').slice(0, 20),
            clienteEmail: body.cliente_email?.trim() || null,
            dataHoraInicio: inicioUtc,
            dataHoraFim: fimUtc,
            status: 'PENDENTE',
            statusConfirmacao: null,
            notasInternas: null,
          },
          { client: trx }
        )
      })

      await logAttempt('sucesso')
      invalidateSlotCacheForUser(user.id)
      await notificacao.agendamentoCriado(created!, 'publico')

      return response.created({
        agendamento_id: created!.id,
        status: 'PENDENTE' as const,
      })
    } catch (e: unknown) {
      if (e instanceof SlotConflictError) {
        await logAttempt('conflito', e.message)
        return response.conflict({
          mensagem: 'Horário não está mais disponível.',
          slots_sugeridos: e.sugestoes,
        })
      }
      await logAttempt('erro', e instanceof Error ? e.message : 'unknown')
      throw e
    }
  }
}
