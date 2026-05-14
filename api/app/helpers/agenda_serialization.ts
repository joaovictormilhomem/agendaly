import type Agendamento from '#models/agendamento'

export function serializeAgendamentoListItem(a: Agendamento) {
  const s = a.servico
  return {
    id: a.id,
    cliente_nome: a.clienteNome,
    cliente_whatsapp: a.clienteWhatsapp,
    cliente_email: a.clienteEmail ?? '',
    servico: {
      nome: s.nome,
      emoji: s.emoji,
      duracao_minutos: s.duracaoMinutos,
      preco: Number(s.preco),
    },
    data_hora_inicio: a.dataHoraInicio.toISO()!,
    data_hora_fim: a.dataHoraFim.toISO()!,
    status: a.status,
    status_confirmacao: a.statusConfirmacao,
    notas_internas: a.notasInternas,
  }
}
