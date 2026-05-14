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
      cliente_nome: "Ana Paula",
      cliente_email: "ana.paula@email.com",
      cliente_whatsapp: "(63) 99999-0001",
      servico: {
        nome: "Alongamento em Gel",
        emoji: "💅",
        duracao_minutos: 90,
        preco: 120,
      },
      data_hora_inicio: fmt(date, 9),
      data_hora_fim: fmt(date, 10, 30),
      status: "CONFIRMADO",
      status_confirmacao: "confirmado_cliente",
      notas_internas: null,
      created_at: fmt(date, 8),
    },
    {
      id: `ag-${offset}-002`,
      cliente_nome: "Carla Menezes",
      cliente_email: "carla@email.com",
      cliente_whatsapp: "(63) 99999-0002",
      servico: {
        nome: "Manutenção",
        emoji: "✨",
        duracao_minutos: 60,
        preco: 60,
      },
      data_hora_inicio: fmt(date, 10, 30),
      data_hora_fim: fmt(date, 11, 30),
      status: "CONFIRMADO",
      status_confirmacao: "confirmado_cliente",
      notas_internas: null,
      created_at: fmt(date, 8),
    },
    {
      id: `ag-${offset}-003`,
      cliente_nome: "Bianca Lima",
      cliente_email: "bianca@email.com",
      cliente_whatsapp: "(63) 99999-0003",
      servico: {
        nome: "Nail Art",
        emoji: "🎨",
        duracao_minutos: 45,
        preco: 50,
      },
      data_hora_inicio: fmt(date, 14),
      data_hora_fim: fmt(date, 14, 45),
      status: "PENDENTE",
      status_confirmacao: null,
      notas_internas: null,
      created_at: fmt(date, 8),
    },
    {
      id: `ag-${offset}-004`,
      cliente_nome: "Juliana F.",
      cliente_email: "juliana@email.com",
      cliente_whatsapp: "(63) 99999-0004",
      servico: {
        nome: "Esmaltação Comum",
        emoji: "🌸",
        duracao_minutos: 30,
        preco: 30,
      },
      data_hora_inicio: fmt(date, 15, 30),
      data_hora_fim: fmt(date, 16),
      status: "CONFIRMADO",
      status_confirmacao: "confirmado_cliente",
      notas_internas: null,
      created_at: fmt(date, 8),
    },
  ]
}

export const agendamentosMock: Agendamento[] = makeAgendamentos(today, 0)

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
