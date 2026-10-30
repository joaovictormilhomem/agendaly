import logger from '@adonisjs/core/services/logger'
import { DateTime } from 'luxon'
import crypto from 'node:crypto'
import type Agendamento from '#models/agendamento'
import WhatsappMensagem, { type WhatsappMensagemContexto } from '#models/whatsapp_mensagem'
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

function descricaoServico(ag: Agendamento): string {
  const base = ag.servico.nome
  const incs = ag.incrementos ?? []
  if (incs.length === 0) return base
  return `${base} (${incs.map((i) => [i.nome, ...(i.adicionais ?? []).map((a) => a.nome)].join(' + ')).join(' + ')})`
}

function textoErro(erro: string): string {
  return erro.trim().slice(0, 1000) || 'Falha ao enviar WhatsApp'
}

export default class NotificacaoAgendamentoService {
  private async nomeProfissionalParaCliente(ag: Agendamento): Promise<string> {
    await ag.load('user', (q) => q.preload('configuracao'))
    const c = ag.user.configuracao
    return (c?.nomeExibicao || c?.nomeProfissional || ag.user.name || 'Profissional').trim()
  }

  /**
   * Grava a tentativa antes de responder a requisição e dispara o envio
   * sem aguardar o worker. Fechar a página do cliente não cancela a promise.
   */
  private async registrarEDisparar(
    agendamento: Agendamento,
    contexto: WhatsappMensagemContexto,
    corpo: string
  ) {
    const destinatario = digitsParaWhatsapp(agendamento.clienteWhatsapp).slice(0, 20)
    const mensagem = await WhatsappMensagem.create({
      id: crypto.randomUUID(),
      userId: agendamento.userId,
      agendamentoId: agendamento.id,
      contexto,
      destinatario,
      corpo,
      status: 'pendente',
      erro: null,
      chatId: null,
      messageId: null,
    })

    void this.enviarSeConectado(mensagem, destinatario).catch((err) => {
      logger.error({ err, mensagemId: mensagem.id }, '[notificacao] falha inesperada no envio')
    })
  }

  private async marcarFalha(mensagem: WhatsappMensagem, erro: string) {
    mensagem.status = 'falhou'
    mensagem.erro = textoErro(erro)
    mensagem.chatId = null
    mensagem.messageId = null
    await mensagem.save()
    logger.warn(
      { userId: mensagem.userId, mensagemId: mensagem.id, erro: mensagem.erro },
      '[notificacao] WhatsApp não enviado'
    )
  }

  private async enviarSeConectado(mensagem: WhatsappMensagem, destinatario: string) {
    if (!bridge.isEnabled()) {
      await this.marcarFalha(mensagem, 'WhatsApp não está configurado no servidor')
      return
    }
    if (destinatario.length < 10) {
      await this.marcarFalha(mensagem, 'Número inválido')
      return
    }

    const status = await bridge.getSessionStatus(mensagem.userId)
    if (status?.state !== 'ready') {
      const detalhe =
        status?.error === 'timeout'
          ? 'Tempo esgotado ao consultar a sessão'
          : `Sessão WhatsApp não está pronta (${status?.state ?? 'desconhecida'})`
      await this.marcarFalha(mensagem, detalhe)
      return
    }

    const resultado = await bridge.sendText(mensagem.userId, destinatario, mensagem.corpo)
    if (!resultado.ok) {
      await this.marcarFalha(mensagem, resultado.erro ?? 'Falha ao enviar WhatsApp')
      return
    }

    mensagem.status = 'enviado'
    mensagem.erro = null
    mensagem.chatId = resultado.chatId
    mensagem.messageId = resultado.messageId
    await mensagem.save()
    logger.info({ userId: mensagem.userId, to: destinatario }, '[notificacao] WhatsApp enviado')
  }

  /**
   * Novo agendamento (público ou manual): confirmação para o cliente.
   */
  async agendamentoCriado(agendamento: Agendamento, contexto: 'publico' | 'manual_admin') {
    await agendamento.load('servico')
    await agendamento.load('incrementos', (q) => q.preload('adicionais'))
    const nomeProf = await this.nomeProfissionalParaCliente(agendamento)
    const quando = formatarDataHoraLocal(agendamento.dataHoraInicio.toISO()!)
    const servico = descricaoServico(agendamento)

    let corpo: string
    if (agendamento.status === 'PENDENTE') {
      corpo = `Olá, ${agendamento.clienteNome}! 👋\n\nRecebemos seu pedido de agendamento com *${nomeProf}*.\n\n📅 *${quando}*\n✨ ${servico}\n\nStatus: aguardando confirmação. Em breve entraremos em contato se necessário.`
    } else {
      corpo = `Olá, ${agendamento.clienteNome}! 👋\n\nSeu agendamento com *${nomeProf}* está *confirmado*.\n\n📅 *${quando}*\n✨ ${servico}\n\nTe esperamos no horário combinado.`
    }

    await this.registrarEDisparar(agendamento, 'agendamento_criado', corpo)
    logger.info({ agendamentoId: agendamento.id, contexto }, '[notificacao] agendamento criado')
  }

  /**
   * Profissional confirmou um agendamento que estava pendente.
   */
  async agendamentoConfirmadoPeloAdmin(agendamento: Agendamento) {
    await agendamento.load('servico')
    await agendamento.load('incrementos', (q) => q.preload('adicionais'))
    const nomeProf = await this.nomeProfissionalParaCliente(agendamento)
    const quando = formatarDataHoraLocal(agendamento.dataHoraInicio.toISO()!)
    const servico = descricaoServico(agendamento)
    const corpo = `Olá, ${agendamento.clienteNome}! ✅\n\nSeu horário com *${nomeProf}* foi *confirmado*.\n\n📅 *${quando}*\n✨ ${servico}`
    await this.registrarEDisparar(agendamento, 'confirmado_admin', corpo)
    logger.info({ agendamentoId: agendamento.id }, '[notificacao] confirmado pelo admin')
  }

  /**
   * Agendamento cancelado (painel admin).
   */
  async agendamentoCancelado(agendamento: Agendamento, motivo: string | null) {
    await agendamento.load('servico')
    await agendamento.load('incrementos', (q) => q.preload('adicionais'))
    const nomeProf = await this.nomeProfissionalParaCliente(agendamento)
    const quando = formatarDataHoraLocal(agendamento.dataHoraInicio.toISO()!)
    const servico = descricaoServico(agendamento)
    const extra = motivo?.trim() ? `\n\nMotivo: ${motivo.trim()}` : ''
    const corpo = `Olá, ${agendamento.clienteNome}.\n\nInformamos que seu agendamento com *${nomeProf}* foi *cancelado*.\n\n📅 Era em *${quando}*\n✨ ${servico}${extra}\n\nQualquer dúvida, fale com a profissional pelo canal de contato habitual.`
    await this.registrarEDisparar(agendamento, 'cancelado', corpo)
    logger.info({ agendamentoId: agendamento.id }, '[notificacao] cancelamento')
  }
}
