import { DEFAULT_DIAS } from '#constants/disponibilidade_defaults'
import Agendamento from '#models/agendamento'
import BloqueioAgenda from '#models/bloqueio_agenda'
import Disponibilidade from '#models/disponibilidade'
import Servico from '#models/servico'
import User from '#models/user'
import { DateTime } from 'luxon'
import crypto from 'node:crypto'

/** Calendário e turnos da profissional (mesma convenção do restante do produto). */
export const AGENDA_TIME_ZONE = 'America/Sao_Paulo'

const SLOT_CACHE_TTL_MS = 120_000
const slotCache = new Map<string, { expires: number; payload: { hora: string; disponivel: boolean }[] }>()

export function invalidateSlotCacheForUser(userId: string) {
  const prefix = `${userId}:`
  for (const k of slotCache.keys()) {
    if (k.startsWith(prefix)) slotCache.delete(k)
  }
}

function cacheKey(userId: string, data: string, servicoId: string, mode: 'public' | 'manual') {
  return `${userId}:${data}:${servicoId}:${mode}`
}

function parseHhMm(s: string): { h: number; m: number } {
  const [h, m] = s.split(':').map((x) => Number.parseInt(x, 10))
  return { h, m }
}

function minutesSinceMidnight(dt: DateTime): number {
  return dt.hour * 60 + dt.minute
}

function atMinutesOnDay(dayStart: DateTime, mins: number): DateTime {
  return dayStart.plus({ minutes: mins })
}

function rangesOverlap(a0: DateTime, a1: DateTime, b0: DateTime, b1: DateTime): boolean {
  return a0 < b1 && b0 < a1
}

function isPendenteAtivo(a: Agendamento, now: DateTime): boolean {
  if (a.status !== 'PENDENTE') return false
  return a.createdAt > now.minus({ minutes: 10 })
}

function agendamentoInflatedEnd(a: Agendamento, intervaloAposMin: number): DateTime {
  return a.dataHoraFim.plus({ minutes: intervaloAposMin })
}

/** Luxon weekday 1–7 (seg–dom) → 0–6 com domingo = 0 (igual ao front). */
function jsWeekdayFromLuxon(dt: DateTime): number {
  return dt.weekday === 7 ? 0 : dt.weekday
}

export type SlotMode = 'public' | 'manual'

export default class SlotEngineService {
  /**
   * BE-6: slots livres a partir da disponibilidade (grid + intervalos do dia).
   * `mode=manual` usa os mesmos turnos configurados; ignora bloqueio de agenda e, na checagem de choque,
   * considera só CONFIRMADOS (PENDENTE não bloqueia o agendamento manual na grade).
   */
  async computeSlots(params: {
    user: User
    data: string
    servico: Servico
    mode: SlotMode
  }): Promise<{ hora: string; disponivel: boolean }[]> {
    const { user, data, servico, mode } = params
    const key = cacheKey(user.id, data, servico.id, mode)
    const now = DateTime.now().setZone(AGENDA_TIME_ZONE)
    const hit = slotCache.get(key)
    if (hit && hit.expires > Date.now()) {
      return hit.payload
    }

    const dayStart = DateTime.fromFormat(data, 'yyyy-LL-dd', { zone: AGENDA_TIME_ZONE }).startOf('day')
    const dayEnd = dayStart.endOf('day')

    const todayStart = now.startOf('day')
    if (dayStart < todayStart) {
      const empty: { hora: string; disponivel: boolean }[] = []
      slotCache.set(key, { expires: Date.now() + SLOT_CACHE_TTL_MS, payload: empty })
      return empty
    }

    const disp =
      (await Disponibilidade.query().where('user_id', user.id).first()) ??
      (await Disponibilidade.create({
        id: crypto.randomUUID(),
        userId: user.id,
        intervaloAtendimentoMinutos: 30,
        dias: DEFAULT_DIAS,
      }))

    const intervaloGrid = disp.intervaloAtendimentoMinutos
    const intervaloApos = disp.intervaloAtendimentoMinutos
    const duracao = servico.duracaoMinutos

    const agendamentos = await Agendamento.query()
      .where('user_id', user.id)
      .where((q) => {
        q.where('data_hora_inicio', '<', dayEnd.toUTC().toISO()!).where('data_hora_fim', '>', dayStart.toUTC().toISO()!)
      })
      .whereIn('status', ['CONFIRMADO', 'PENDENTE'])

    const ativos = agendamentos.filter((a) => {
      if (a.status === 'CANCELADO') return false
      if (a.status === 'CONFIRMADO') return true
      return isPendenteAtivo(a, DateTime.utc())
    })

    const bloqueioNoDia =
      mode === 'public'
        ? await BloqueioAgenda.query().where('user_id', user.id).where('data', data).first()
        : null

    if (mode === 'public' && bloqueioNoDia) {
      const empty: { hora: string; disponivel: boolean }[] = []
      slotCache.set(key, { expires: Date.now() + SLOT_CACHE_TTL_MS, payload: empty })
      return empty
    }

    const diaCfg = disp.dias.find((d) => d.dia === jsWeekdayFromLuxon(dayStart))
    if (!diaCfg?.ativo) {
      const empty: { hora: string; disponivel: boolean }[] = []
      slotCache.set(key, { expires: Date.now() + SLOT_CACHE_TTL_MS, payload: empty })
      return empty
    }

    const candidatos: DateTime[] = []
    for (const intervalo of diaCfg.intervalos) {
      const { h: h0, m: m0 } = parseHhMm(intervalo.hora_inicio)
      const { h: h1, m: m1 } = parseHhMm(intervalo.hora_fim)
      const startMin = h0 * 60 + m0
      const endMin = h1 * 60 + m1
      let m = startMin
      while (m < endMin) {
        const start = atMinutesOnDay(dayStart, m)
        const fimComBuffer = start.plus({ minutes: duracao + intervaloApos })
        const intervalEnd = atMinutesOnDay(dayStart, endMin)
        if (fimComBuffer <= intervalEnd) {
          candidatos.push(start)
        }
        m += intervaloGrid
      }
    }

    const bloqueadores =
      mode === 'manual'
        ? ativos.filter((a) => a.status === 'CONFIRMADO')
        : ativos

    const result: { hora: string; disponivel: boolean }[] = []

    for (const start of candidatos) {
      if (dayStart.hasSame(now, 'day') && start <= now) {
        continue
      }
      const c0 = start.toUTC()
      const c1 = start.plus({ minutes: duracao }).toUTC()
      let livre = true
      for (const a of bloqueadores) {
        const a0 = a.dataHoraInicio
        const a1 = agendamentoInflatedEnd(a, intervaloApos)
        if (rangesOverlap(c0, c1, a0, a1)) {
          livre = false
          break
        }
      }
      if (livre) {
        const local = start.setZone(AGENDA_TIME_ZONE)
        const hora = `${String(local.hour).padStart(2, '0')}:${String(local.minute).padStart(2, '0')}`
        result.push({ hora, disponivel: true })
      }
    }

    slotCache.set(key, { expires: Date.now() + SLOT_CACHE_TTL_MS, payload: result })
    return result
  }

  /**
   * Verifica se o intervalo [inicio, fim) está livre para reserva pública (BE-7).
   */
  slotLivreParaReservaPublica(params: {
    servico: Servico
    inicioUtc: DateTime
    bloqueadores: Agendamento[]
    intervaloAposMinutos: number
  }): boolean {
    const { servico, inicioUtc, bloqueadores, intervaloAposMinutos } = params
    const c0 = inicioUtc
    const c1 = inicioUtc.plus({ minutes: servico.duracaoMinutos })
    const now = DateTime.utc()
    for (const a of bloqueadores) {
      if (a.status === 'CANCELADO') continue
      if (a.status === 'PENDENTE' && !isPendenteAtivo(a, now)) continue
      if (a.status === 'PENDENTE' || a.status === 'CONFIRMADO') {
        const a0 = a.dataHoraInicio
        const a1 = agendamentoInflatedEnd(a, intervaloAposMinutos)
        if (rangesOverlap(c0, c1, a0, a1)) return false
      }
    }
    return true
  }

  /**
   * Próximos horários livres (strings HH:mm no fuso AGENDA_TIME_ZONE) após um instante.
   */
  async proximosSlotsLivres(params: {
    user: User
    servico: Servico
    aposUtc: DateTime
    limite: number
  }): Promise<string[]> {
    const { user, servico, aposUtc, limite } = params
    const zoned = aposUtc.setZone(AGENDA_TIME_ZONE)
    const data = zoned.toFormat('yyyy-LL-dd')
    const slots = await this.computeSlots({ user, data, servico, mode: 'public' })
    const aposMin = minutesSinceMidnight(zoned)
    const horas: string[] = []
    for (const s of slots) {
      if (!s.disponivel) continue
      const { h, m } = parseHhMm(s.hora)
      const sm = h * 60 + m
      if (sm > aposMin) {
        horas.push(s.hora)
        if (horas.length >= limite) break
      }
    }
    if (horas.length < limite) {
      const nextDay = DateTime.fromFormat(data, 'yyyy-LL-dd', { zone: AGENDA_TIME_ZONE })
        .plus({ days: 1 })
        .toFormat('yyyy-LL-dd')
      const slots2 = await this.computeSlots({ user, data: nextDay, servico, mode: 'public' })
      for (const s of slots2) {
        if (!s.disponivel) continue
        horas.push(s.hora)
        if (horas.length >= limite) break
      }
    }
    return horas.slice(0, limite)
  }

  /**
   * BE-7: revalidação do horário (expediente, bloqueio, conflitos) após lock.
   */
  async podeReservarPublico(params: {
    user: User
    servico: Servico
    inicioUtc: DateTime
  }): Promise<boolean> {
    const { user, servico, inicioUtc } = params
    const z = inicioUtc.setZone(AGENDA_TIME_ZONE)
    const data = z.toFormat('yyyy-LL-dd')
    const dayStart = DateTime.fromFormat(data, 'yyyy-LL-dd', { zone: AGENDA_TIME_ZONE }).startOf('day')
    const dayEnd = dayStart.endOf('day')

    const bloqueio = await BloqueioAgenda.query().where('user_id', user.id).where('data', data).first()
    if (bloqueio) return false

    const disp =
      (await Disponibilidade.query().where('user_id', user.id).first()) ??
      (await Disponibilidade.create({
        id: crypto.randomUUID(),
        userId: user.id,
        intervaloAtendimentoMinutos: 30,
        dias: DEFAULT_DIAS,
      }))

    const intervaloApos = disp.intervaloAtendimentoMinutos
    const diaCfg = disp.dias.find((d) => d.dia === jsWeekdayFromLuxon(dayStart))
    if (!diaCfg?.ativo) return false

    const zMinutes = z.hour * 60 + z.minute + z.second / 60
    const duracao = servico.duracaoMinutos
    let dentroDeTurno = false
    for (const intervalo of diaCfg.intervalos) {
      const { h: h0, m: m0 } = parseHhMm(intervalo.hora_inicio)
      const { h: h1, m: m1 } = parseHhMm(intervalo.hora_fim)
      const startMin = h0 * 60 + m0
      const endMin = h1 * 60 + m1
      const fimServicoMin = zMinutes + duracao
      if (zMinutes >= startMin && fimServicoMin <= endMin) {
        dentroDeTurno = true
        break
      }
    }
    if (!dentroDeTurno) return false

    const agendamentos = await Agendamento.query()
      .where('user_id', user.id)
      .where((q) => {
        q.where('data_hora_inicio', '<', dayEnd.toUTC().toISO()!).where('data_hora_fim', '>', dayStart.toUTC().toISO()!)
      })
      .whereIn('status', ['CONFIRMADO', 'PENDENTE'])

    return this.slotLivreParaReservaPublica({
      servico,
      inicioUtc,
      bloqueadores: agendamentos,
      intervaloAposMinutos: intervaloApos,
    })
  }

  /** BE-9 manual: retorna true se sobrepõe algum CONFIRMADO (inclui buffer após término). */
  async conflitaManualComConfirmado(params: {
    userId: string
    inicioUtc: DateTime
    fimUtc: DateTime
    intervaloAposMinutos: number
  }): Promise<boolean> {
    const { userId, inicioUtc, fimUtc, intervaloAposMinutos } = params
    const list = await Agendamento.query()
      .where('user_id', userId)
      .where('status', 'CONFIRMADO')
      .where('data_hora_inicio', '<', fimUtc.plus({ minutes: intervaloAposMinutos }).toISO()!)
      .where('data_hora_fim', '>', inicioUtc.toISO()!)

    const c0 = inicioUtc
    const c1 = fimUtc
    for (const a of list) {
      const a0 = a.dataHoraInicio
      const a1 = agendamentoInflatedEnd(a, intervaloAposMinutos)
      if (rangesOverlap(c0, c1, a0, a1)) return true
    }
    return false
  }
}
