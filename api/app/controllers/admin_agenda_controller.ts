import Agendamento from '#models/agendamento'
import AgendamentoCancelamento from '#models/agendamento_cancelamento'
import Disponibilidade from '#models/disponibilidade'
import Servico from '#models/servico'
import User from '#models/user'
import { serializeAgendamentoListItem } from '#helpers/agenda_serialization'
import NotificacaoAgendamentoService from '#services/notificacao_agendamento_service'
import SlotEngineService, { AGENDA_TIME_ZONE, invalidateSlotCacheForUser } from '#services/slot_engine_service'
import { agendaManualValidator, agendaStatusValidator } from '#validators/agenda_admin'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import crypto from 'node:crypto'

const slotEngine = new SlotEngineService()
const notificacao = new NotificacaoAgendamentoService()

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

export default class AdminAgendaController {
  /**
   * BE-9: GET /api/admin/:slug/agenda?data= | ?data_inicio=&data_fim=
   */
  async index({ params, request, authJwt, response }: HttpContext) {
    const user = await findUserAndAuthorize(params.slug, authJwt, response)
    if (!user) return

    const data = request.input('data') as string | undefined
    const dataInicio = request.input('data_inicio') as string | undefined
    const dataFim = request.input('data_fim') as string | undefined

    let inicioStr: string
    let fimStr: string

    if (dataInicio && dataFim) {
      inicioStr = dataInicio
      fimStr = dataFim
      const a = DateTime.fromFormat(dataInicio, 'yyyy-LL-dd', { zone: AGENDA_TIME_ZONE })
      const b = DateTime.fromFormat(dataFim, 'yyyy-LL-dd', { zone: AGENDA_TIME_ZONE })
      if (!a.isValid || !b.isValid || b < a) {
        return response.badRequest({ message: 'data_inicio e data_fim inválidos' })
      }
    } else if (data) {
      inicioStr = data
      fimStr = data
      const d = DateTime.fromFormat(data, 'yyyy-LL-dd', { zone: AGENDA_TIME_ZONE })
      if (!d.isValid) return response.badRequest({ message: 'data inválida' })
    } else {
      return response.badRequest({ message: 'Informe data ou data_inicio e data_fim' })
    }

    const rangeStart = DateTime.fromFormat(inicioStr, 'yyyy-LL-dd', { zone: AGENDA_TIME_ZONE }).startOf('day')
    const rangeEnd = DateTime.fromFormat(fimStr, 'yyyy-LL-dd', { zone: AGENDA_TIME_ZONE }).endOf('day')
    const startUtc = rangeStart.toUTC()
    const endUtc = rangeEnd.toUTC()

    const rows = await Agendamento.query()
      .where('user_id', user.id)
      .where('data_hora_inicio', '<', endUtc.toISO()!)
      .where('data_hora_fim', '>', startUtc.toISO()!)
      .preload('servico')
      .orderBy('data_hora_inicio', 'asc')

    return response.ok({
      periodo: { inicio: inicioStr, fim: fimStr },
      agendamentos: rows.map(serializeAgendamentoListItem),
    })
  }

  /**
   * BE-9: GET /api/admin/:slug/agenda/:id
   */
  async show({ params, authJwt, response }: HttpContext) {
    const user = await findUserAndAuthorize(params.slug, authJwt, response)
    if (!user) return

    const ag = await Agendamento.query()
      .where('id', params.id)
      .where('user_id', user.id)
      .preload('servico')
      .first()

    if (!ag) return response.notFound({ message: 'Agendamento não encontrado' })

    return response.ok({
      ...serializeAgendamentoListItem(ag),
      created_at: ag.createdAt.toISO(),
    })
  }

  /**
   * BE-9: POST /api/admin/:slug/agenda/manual
   */
  async manual({ params, request, authJwt, response }: HttpContext) {
    const user = await findUserAndAuthorize(params.slug, authJwt, response)
    if (!user) return

    const body = await request.validateUsing(agendaManualValidator)

    const servico = await Servico.query()
      .where('id', body.servicoId)
      .where('user_id', user.id)
      .where('ativo', true)
      .first()

    if (!servico) return response.notFound({ message: 'Serviço não encontrado' })

    const inicioUtc = DateTime.fromISO(body.data_hora_inicio, { setZone: true })
    if (!inicioUtc.isValid) {
      return response.badRequest({ message: 'data_hora_inicio inválido (use ISO 8601)' })
    }

    const disp = await Disponibilidade.query().where('user_id', user.id).first()
    const intervaloApos = disp?.intervaloAtendimentoMinutos ?? 30
    const fimUtc = inicioUtc.plus({ minutes: servico.duracaoMinutos })

    const conflito = await slotEngine.conflitaManualComConfirmado({
      userId: user.id,
      inicioUtc,
      fimUtc,
      intervaloAposMinutos: intervaloApos,
    })
    if (conflito) {
      return response.conflict({ message: 'Horário conflita com agendamento confirmado' })
    }

    const ag = await Agendamento.create({
      id: crypto.randomUUID(),
      userId: user.id,
      servicoId: servico.id,
      clienteNome: body.cliente_nome,
      clienteWhatsapp: body.cliente_whatsapp.replace(/\D/g, '').slice(0, 20),
      clienteEmail: body.cliente_email?.trim() || null,
      dataHoraInicio: inicioUtc,
      dataHoraFim: fimUtc,
      status: 'CONFIRMADO',
      statusConfirmacao: 'manual_admin',
      notasInternas: body.notas_internas,
    })

    await ag.load('servico')
    invalidateSlotCacheForUser(user.id)
    await notificacao.agendamentoCriado(ag, 'manual_admin')

    return response.created(serializeAgendamentoListItem(ag))
  }

  /**
   * BE-9: PATCH /api/admin/:slug/agenda/:id/status
   */
  async updateStatus({ params, request, authJwt, response }: HttpContext) {
    const user = await findUserAndAuthorize(params.slug, authJwt, response)
    if (!user) return

    const body = await request.validateUsing(agendaStatusValidator)

    const ag = await Agendamento.query().where('id', params.id).where('user_id', user.id).first()

    if (!ag) return response.notFound({ message: 'Agendamento não encontrado' })

    if (body.status === 'CANCELADO') {
      if (ag.status === 'CANCELADO') {
        return response.badRequest({ message: 'Agendamento já cancelado' })
      }
      ag.status = 'CANCELADO'
      await ag.save()

      await AgendamentoCancelamento.create({
        id: crypto.randomUUID(),
        agendamentoId: ag.id,
        motivo: body.motivo ?? null,
      })
      invalidateSlotCacheForUser(user.id)
      await ag.load('servico')
      return response.ok(serializeAgendamentoListItem(ag))
    }

    if (body.status === 'CONFIRMADO') {
      if (ag.status === 'CANCELADO') {
        return response.badRequest({ message: 'Não é possível confirmar agendamento cancelado' })
      }
      if (ag.status === 'CONFIRMADO') {
        await ag.load('servico')
        return response.ok(serializeAgendamentoListItem(ag))
      }
      ag.status = 'CONFIRMADO'
      ag.statusConfirmacao = 'confirmado_cliente'
      await ag.save()
      invalidateSlotCacheForUser(user.id)
      await ag.load('servico')
      return response.ok(serializeAgendamentoListItem(ag))
    }

    return response.badRequest({ message: 'Status inválido' })
  }
}
