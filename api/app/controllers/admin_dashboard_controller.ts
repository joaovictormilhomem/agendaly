import Agendamento from '#models/agendamento'
import User from '#models/user'
import { serializeAgendamentoListItem } from '#helpers/agenda_serialization'
import { AGENDA_TIME_ZONE } from '#services/slot_engine_service'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

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

function isPendenteAtivo(createdAt: DateTime): boolean {
  return createdAt > DateTime.utc().minus({ minutes: 10 })
}

export default class AdminDashboardController {
  async show({ params, authJwt, response }: HttpContext) {
    const user = await findUserAndAuthorize(params.slug, authJwt, response)
    if (!user) return

    const now = DateTime.now().setZone(AGENDA_TIME_ZONE)
    const todayStart = now.startOf('day')
    const todayEnd = todayStart.endOf('day')
    const weekStart = now.startOf('week')
    const monthStart = now.startOf('month')

    const t0 = todayStart.toUTC().toISO()!
    const t1 = todayEnd.toUTC().toISO()!
    const w0 = weekStart.toUTC().toISO()!
    const m0 = monthStart.toUTC().toISO()!
    const utcNow = DateTime.utc().toISO()!

    const base = () =>
      Agendamento.query().where('user_id', user.id).whereNot('status', 'CANCELADO')

    const hoje = await base().where('data_hora_inicio', '>=', t0).where('data_hora_inicio', '<=', t1)

    const estaSemana = await base()
      .where('data_hora_inicio', '>=', w0)
      .where('data_hora_inicio', '<=', t1)

    const esteMes = await base().where('data_hora_inicio', '>=', m0)

    const confirmadosMes = await Agendamento.query()
      .where('user_id', user.id)
      .where('status', 'CONFIRMADO')
      .where('data_hora_inicio', '>=', m0)
      .preload('servico')

    const agendaRows = await Agendamento.query()
      .where('user_id', user.id)
      .where('data_hora_inicio', '>=', t0)
      .where('data_hora_inicio', '<=', t1)
      .preload('servico')
      .orderBy('data_hora_inicio', 'asc')

    const futuros = await Agendamento.query()
      .where('user_id', user.id)
      .whereNot('status', 'CANCELADO')
      .where('data_hora_inicio', '>', utcNow)
      .preload('servico')
      .orderBy('data_hora_inicio', 'asc')
      .limit(20)

    let proximo: Agendamento | null = null
    for (const a of futuros) {
      if (a.status === 'CONFIRMADO') {
        proximo = a
        break
      }
      if (a.status === 'PENDENTE' && isPendenteAtivo(a.createdAt)) {
        proximo = a
        break
      }
    }

    const receita = confirmadosMes.reduce((s, a) => s + Number(a.servico.preco), 0)

    return response.ok({
      stats: {
        hoje: hoje.length,
        esta_semana: estaSemana.length,
        este_mes: esteMes.length,
        receita_estimada: receita,
      },
      agenda_hoje: agendaRows.map(serializeAgendamentoListItem),
      proximo_atendimento: proximo ? serializeAgendamentoListItem(proximo) : null,
    })
  }
}
