import logger from '@adonisjs/core/services/logger'
import { DateTime } from 'luxon'
import type Agendamento from '#models/agendamento'
import { AGENDA_TIME_ZONE } from '#services/slot_engine_service'
import WhatsappBridgeService from '#services/whatsapp_bridge_service'

const bridge = new WhatsappBridgeService()

/** Dígitos para envio no WhatsApp (c.us); assume BR se não houver código do país. */
export function digitsParaWhatsapp(toRaw: string): string {
  const d = toRaw.replace(/\D/g, '')
  if (!d) return d
  if (d.startsWith('55') && d.length >= 12) return d.slice(0, 15)
  if (d.length === 10 || d.length === 11) return `55${d}`.slice(0, 15)
  return d.slice(0, 15)
}

function formatarDataHoraLocal(iso: string | null | undefined): string {
  if (!iso) return ''
  const dt = DateTime.fromISO(iso, { setZone: true }).setZone(AGENDA_TIME_ZONE)
  if (!dt.isValid) return iso
  return dt.toFormat("dd/MM/yyyy 'às' HH:mm")
}

export default class NotificacaoAgendamentoService {
  private async nomeProfissionalParaCliente(ag: Agendamento): Promise<string> {
    await ag.load('user', (q) => q.preload('configuracao'))
    const c = ag.user.configuracao
    return (c?.nomeExibicao || c?.nomeProfissional || ag.user.name || 'Profissional').trim()
  }

  private async enviarSeConectado(userId: string, clienteWhatsapp: string, texto: string) {
    if (!bridge.isEnabled()) {
      logger.debug({ userId }, '[notificacao] bridge WhatsApp desligado')
      return
    }
    const to = digitsParaWhatsapp(clienteWhatsapp)
    if (to.length < 10) {
      logger.warn({ userId, clienteWhatsapp }, '[notificacao] número inválido, não enviado')
      return
    }
    const status = await bridge.getSessionStatus(userId)
    if (status?.state !== 'ready') {
      logger.info(
        { userId, state: status?.state },
        '[notificacao] sessão WA não pronta, não enviado'
      )
      return
    }
    const ok = await bridge.sendText(userId, to, texto)
    if (ok) {
      logger.info({ userId, to }, '[notificacao] WhatsApp enviado')
    }
  }

  /**
   * Novo agendamento (público ou manual): confirmação para o cliente.
   */
  async agendamentoCriado(agendamento: Agendamento, contexto: 'publico' | 'manual_admin') {
    await agendamento.load('servico')
    const nomeProf = await this.nomeProfissionalParaCliente(agendamento)
    const quando = formatarDataHoraLocal(agendamento.dataHoraInicio.toISO()!)
    const servico = agendamento.servico.nome

    let corpo: string
    if (agendamento.status === 'PENDENTE') {
      corpo = `Olá, ${agendamento.clienteNome}! 👋\n\nRecebemos seu pedido de agendamento com *${nomeProf}*.\n\n📅 *${quando}*\n✨ ${servico}\n\nStatus: aguardando confirmação. Em breve entraremos em contato se necessário.`
    } else {
      corpo = `Olá, ${agendamento.clienteNome}! 👋\n\nSeu agendamento com *${nomeProf}* está *confirmado*.\n\n📅 *${quando}*\n✨ ${servico}\n\nTe esperamos no horário combinado.`
    }

    await this.enviarSeConectado(agendamento.userId, agendamento.clienteWhatsapp, corpo)
    logger.info({ agendamentoId: agendamento.id, contexto }, '[notificacao] agendamento criado')
  }

  /**
   * Profissional confirmou um agendamento que estava pendente.
   */
  async agendamentoConfirmadoPeloAdmin(agendamento: Agendamento) {
    await agendamento.load('servico')
    const nomeProf = await this.nomeProfissionalParaCliente(agendamento)
    const quando = formatarDataHoraLocal(agendamento.dataHoraInicio.toISO()!)
    const servico = agendamento.servico.nome
    const corpo = `Olá, ${agendamento.clienteNome}! ✅\n\nSeu horário com *${nomeProf}* foi *confirmado*.\n\n📅 *${quando}*\n✨ ${servico}`
    await this.enviarSeConectado(agendamento.userId, agendamento.clienteWhatsapp, corpo)
    logger.info({ agendamentoId: agendamento.id }, '[notificacao] confirmado pelo admin')
  }

  /**
   * Agendamento cancelado (painel admin).
   */
  async agendamentoCancelado(agendamento: Agendamento, motivo: string | null) {
    await agendamento.load('servico')
    const nomeProf = await this.nomeProfissionalParaCliente(agendamento)
    const quando = formatarDataHoraLocal(agendamento.dataHoraInicio.toISO()!)
    const servico = agendamento.servico.nome
    const extra = motivo?.trim() ? `\n\nMotivo: ${motivo.trim()}` : ''
    const corpo = `Olá, ${agendamento.clienteNome}.\n\nInformamos que seu agendamento com *${nomeProf}* foi *cancelado*.\n\n📅 Era em *${quando}*\n✨ ${servico}${extra}\n\nQualquer dúvida, fale com a profissional pelo canal de contato habitual.`
    await this.enviarSeConectado(agendamento.userId, agendamento.clienteWhatsapp, corpo)
    logger.info({ agendamentoId: agendamento.id }, '[notificacao] cancelamento')
  }
}
