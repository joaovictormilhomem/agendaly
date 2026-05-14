export type AgendamentoStatus = "PENDENTE" | "CONFIRMADO" | "CANCELADO"

export interface AgendamentoServico {
  nome: string
  emoji: string
  duracao_minutos: number
  preco: number
}

export interface Agendamento {
  id: string
  cliente_nome: string
  cliente_email: string
  cliente_whatsapp: string
  servico: AgendamentoServico
  data_hora_inicio: string
  data_hora_fim: string
  status: AgendamentoStatus
  status_confirmacao: string | null
  notas_internas: string | null
  created_at?: string
}

export interface AgendaListResponse {
  periodo: { inicio: string; fim: string }
  agendamentos: Agendamento[]
}

export interface AgendamentoManualCreate {
  cliente_nome: string
  cliente_email?: string
  cliente_whatsapp: string
  servicoId: string
  data_hora_inicio: string
  notas_internas: string
}

export interface AgendaStatusPatch {
  status: "CONFIRMADO" | "CANCELADO"
  motivo?: string
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

export interface PublicSlotItem {
  hora: string
  disponivel: boolean
}

export interface AgendarPublicBody {
  cliente_nome: string
  cliente_whatsapp: string
  cliente_email?: string
  servicoId: string
  slot_datetime: string
}

export interface AgendarPublicResponse {
  agendamento_id: string
  status: "PENDENTE"
}

export interface AgendarConflictResponse {
  mensagem: string
  slots_sugeridos: string[]
}
