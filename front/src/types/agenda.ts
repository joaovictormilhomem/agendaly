export type AgendamentoStatus = "PENDENTE" | "CONFIRMADO" | "CANCELADO"

export interface Agendamento {
  id: string
  profissional_id: string
  servico_id: string
  servico_nome: string
  servico_emoji: string
  cliente_nome: string
  cliente_email: string
  cliente_whatsapp: string
  data_hora_inicio: string
  data_hora_fim: string
  status: AgendamentoStatus
  notas_internas: string | null
  created_at: string
}

export interface AgendamentoCreate {
  cliente_nome: string
  cliente_email: string
  cliente_whatsapp: string
  servico_id: string
  data_hora_inicio: string
}

export interface DashboardStats {
  hoje: number
  esta_semana: number
  este_mes: number
  receita_estimada: number
}

export interface DashboardData {
  stats: DashboardStats
  agenda_hoje: Agendamento[]
  proximo_atendimento: Agendamento | null
}
