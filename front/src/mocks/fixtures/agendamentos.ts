import type { Agendamento, DashboardData } from "@/types/agenda"

const today = new Date()
const fmt = (h: number, m = 0) => {
  const d = new Date(today)
  d.setHours(h, m, 0, 0)
  return d.toISOString()
}

export const agendamentosMock: Agendamento[] = [
  {
    id: "ag-001",
    profissional_id: "uuid-001",
    servico_id: "svc-001",
    servico_nome: "Alongamento em Gel",
    servico_emoji: "💅",
    cliente_nome: "Ana Paula",
    cliente_whatsapp: "(63) 99999-0001",
    data_hora_inicio: fmt(9),
    data_hora_fim: fmt(10, 30),
    status: "CONFIRMADO",
    notas_internas: null,
    created_at: fmt(8),
  },
  {
    id: "ag-002",
    profissional_id: "uuid-001",
    servico_id: "svc-002",
    servico_nome: "Manutenção",
    servico_emoji: "✨",
    cliente_nome: "Carla Menezes",
    cliente_whatsapp: "(63) 99999-0002",
    data_hora_inicio: fmt(10, 30),
    data_hora_fim: fmt(11, 30),
    status: "CONFIRMADO",
    notas_internas: null,
    created_at: fmt(8),
  },
  {
    id: "ag-003",
    profissional_id: "uuid-001",
    servico_id: "svc-003",
    servico_nome: "Nail art",
    servico_emoji: "🎨",
    cliente_nome: "Bianca Lima",
    cliente_whatsapp: "(63) 99999-0003",
    data_hora_inicio: fmt(14),
    data_hora_fim: fmt(14, 45),
    status: "PENDENTE",
    notas_internas: null,
    created_at: fmt(8),
  },
  {
    id: "ag-004",
    profissional_id: "uuid-001",
    servico_id: "svc-004",
    servico_nome: "Esmaltação",
    servico_emoji: "🌸",
    cliente_nome: "Juliana F.",
    cliente_whatsapp: "(63) 99999-0004",
    data_hora_inicio: fmt(15, 30),
    data_hora_fim: fmt(16),
    status: "CONFIRMADO",
    notas_internas: null,
    created_at: fmt(8),
  },
]

export const dashboardMock: DashboardData = {
  stats: {
    hoje: 4,
    esta_semana: 18,
    este_mes: 72,
    receita_estimada: 3200,
  },
  agenda_hoje: agendamentosMock,
  proximo_atendimento: agendamentosMock[0],
}
