import type { Agendamento, DashboardData } from "@/types/agenda"

const today = new Date()

function fmt(date: Date, h: number, m = 0) {
  const d = new Date(date)
  d.setHours(h, m, 0, 0)
  return d.toISOString()
}

function dateOffset(days: number): Date {
  const d = new Date(today)
  d.setDate(d.getDate() + days)
  return d
}

function makeAgendamentos(date: Date, offset: number): Agendamento[] {
  return [
    {
      id: `ag-${offset}-001`,
      profissional_id: "uuid-001",
      servico_id: "svc-001",
      servico_nome: "Alongamento em Gel",
      servico_emoji: "💅",
      cliente_nome: "Ana Paula",
      cliente_email: "ana.paula@email.com",
      cliente_whatsapp: "(63) 99999-0001",
      data_hora_inicio: fmt(date, 9),
      data_hora_fim: fmt(date, 10, 30),
      status: "CONFIRMADO",
      notas_internas: null,
      created_at: fmt(date, 8),
    },
    {
      id: `ag-${offset}-002`,
      profissional_id: "uuid-001",
      servico_id: "svc-002",
      servico_nome: "Manutenção",
      servico_emoji: "✨",
      cliente_nome: "Carla Menezes",
      cliente_email: "carla@email.com",
      cliente_whatsapp: "(63) 99999-0002",
      data_hora_inicio: fmt(date, 10, 30),
      data_hora_fim: fmt(date, 11, 30),
      status: "CONFIRMADO",
      notas_internas: null,
      created_at: fmt(date, 8),
    },
    {
      id: `ag-${offset}-003`,
      profissional_id: "uuid-001",
      servico_id: "svc-003",
      servico_nome: "Nail art",
      servico_emoji: "🎨",
      cliente_nome: "Bianca Lima",
      cliente_email: "bianca@email.com",
      cliente_whatsapp: "(63) 99999-0003",
      data_hora_inicio: fmt(date, 14),
      data_hora_fim: fmt(date, 14, 45),
      status: "PENDENTE",
      notas_internas: null,
      created_at: fmt(date, 8),
    },
    {
      id: `ag-${offset}-004`,
      profissional_id: "uuid-001",
      servico_id: "svc-004",
      servico_nome: "Esmaltação",
      servico_emoji: "🌸",
      cliente_nome: "Juliana F.",
      cliente_email: "juliana@email.com",
      cliente_whatsapp: "(63) 99999-0004",
      data_hora_inicio: fmt(date, 15, 30),
      data_hora_fim: fmt(date, 16),
      status: "CONFIRMADO",
      notas_internas: null,
      created_at: fmt(date, 8),
    },
  ]
}

export const agendamentosMock: Agendamento[] = makeAgendamentos(today, 0)

// Keyed by YYYY-MM-DD for quick lookup in handlers
export const agendamentosPorDia: Map<string, Agendamento[]> = new Map([
  [formatDate(dateOffset(-1)), makeAgendamentos(dateOffset(-1), -1).slice(0, 2)],
  [formatDate(today), makeAgendamentos(today, 0)],
  [formatDate(dateOffset(1)), makeAgendamentos(dateOffset(1), 1).slice(0, 3)],
  [formatDate(dateOffset(2)), makeAgendamentos(dateOffset(2), 2).slice(0, 1)],
])

function formatDate(d: Date) {
  return d.toISOString().slice(0, 10)
}

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
