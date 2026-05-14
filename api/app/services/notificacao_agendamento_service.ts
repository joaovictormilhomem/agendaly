import logger from '@adonisjs/core/services/logger'
import type Agendamento from '#models/agendamento'

/**
 * BE-09: ponto único para WhatsApp. MVP: log estruturado (substituir por provedor real).
 */
export default class NotificacaoAgendamentoService {
  async agendamentoCriado(agendamento: Agendamento, contexto: 'publico' | 'manual_admin') {
    logger.info({ agendamentoId: agendamento.id, contexto }, '[notificacao] agendamento criado (stub)')
  }
}
