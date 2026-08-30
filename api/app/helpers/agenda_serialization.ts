import type Agendamento from '#models/agendamento'

export function serializeAgendamentoListItem(a: Agendamento) {
  const s = a.servico
  const incrementos = (a.incrementos ?? []).map((i) => ({
    id: i.id,
    nome: i.nome,
    duracao_minutos: i.duracaoMinutos,
    preco: Number(i.preco),
  }))
  const temIncrementos = incrementos.length > 0
  const duracao = temIncrementos
    ? incrementos.reduce((sum, i) => sum + i.duracao_minutos, 0)
    : s.duracaoMinutos
  const preco = temIncrementos
    ? incrementos.reduce((sum, i) => sum + i.preco, 0)
    : Number(s.preco)

  return {
    id: a.id,
    cliente_nome: a.clienteNome,
    cliente_whatsapp: a.clienteWhatsapp,
    cliente_email: a.clienteEmail ?? '',
    servico: {
      nome: s.nome,
      emoji: s.emoji,
      duracao_minutos: duracao,
      preco,
      incrementos,
    },
    data_hora_inicio: a.dataHoraInicio.toISO()!,
    data_hora_fim: a.dataHoraFim.toISO()!,
    status: a.status,
    status_confirmacao: a.statusConfirmacao,
    notas_internas: a.notasInternas,
  }
}
