import { http, HttpResponse } from "msw"
import { dashboardMock, agendamentosPorDia } from "@/mocks/fixtures/agendamentos"
import { perfilMock } from "@/mocks/fixtures/perfil"
import { disponibilidadeMock } from "@/mocks/fixtures/disponibilidade"
import { servicosMock } from "@/mocks/fixtures/servicos"
import type { Servico } from "@/types/servico"
import type { Disponibilidade } from "@/types/disponibilidade"
import type { Agendamento, AgendamentoCreate } from "@/types/agenda"

// Mutable in-place arrays — same pattern as masterHandlers
const servicos: Servico[] = servicosMock.map((s) => ({ ...s }))
const disponibilidade: Disponibilidade = {
  ...disponibilidadeMock,
  dias: disponibilidadeMock.dias.map((d) => ({ ...d, intervalos: d.intervalos.map((i) => ({ ...i })) })),
  bloqueios: disponibilidadeMock.bloqueios.map((b) => ({ ...b })),
}

// Mutable agenda store keyed by date string YYYY-MM-DD
const agendaStore: Map<string, Agendamento[]> = new Map(
  Array.from(agendamentosPorDia.entries()).map(([k, v]) => [k, v.map((a) => ({ ...a }))])
)

function generateSlots(dayOfWeek: number, intervalMinutes: number): string[] {
  const dia = disponibilidadeMock.dias.find((d) => d.dia === dayOfWeek)
  if (!dia || !dia.ativo) return []
  const slots: string[] = []
  for (const intervalo of dia.intervalos) {
    const [startH, startM] = intervalo.hora_inicio.split(":").map(Number)
    const [endH, endM] = intervalo.hora_fim.split(":").map(Number)
    let current = startH * 60 + startM
    const end = endH * 60 + endM
    while (current < end) {
      const h = Math.floor(current / 60).toString().padStart(2, "0")
      const m = (current % 60).toString().padStart(2, "0")
      slots.push(`${h}:${m}`)
      current += intervalMinutes
    }
  }
  return slots
}

export const adminHandlers = [
  http.get("/api/admin/:slug/dashboard", () => {
    return HttpResponse.json(dashboardMock)
  }),

  http.get("/api/admin/:slug/perfil", () => {
    return HttpResponse.json(perfilMock)
  }),

  http.put("/api/admin/:slug/perfil", async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json({ ...perfilMock, ...(body as object) })
  }),

  // Agenda
  http.get("/api/admin/:slug/agenda", ({ request }) => {
    const url = new URL(request.url)
    const dateStr = url.searchParams.get("date") ?? ""
    const list = agendaStore.get(dateStr) ?? []
    return HttpResponse.json([...list].sort((a, b) => a.data_hora_inicio.localeCompare(b.data_hora_inicio)))
  }),

  http.post("/api/admin/:slug/agenda", async ({ request }) => {
    const body = (await request.json()) as AgendamentoCreate
    const dateStr = body.data_hora_inicio.slice(0, 10)
    const svc = servicos.find((s) => s.id === body.servico_id)
    const duracao = svc?.duracao_minutos ?? 60
    const inicio = new Date(body.data_hora_inicio)
    const fim = new Date(inicio.getTime() + duracao * 60000)

    const novo: Agendamento = {
      id: `ag-${Date.now()}`,
      profissional_id: "uuid-001",
      servico_id: body.servico_id,
      servico_nome: svc?.nome ?? "Serviço",
      servico_emoji: svc?.emoji ?? "📅",
      cliente_nome: body.cliente_nome,
      cliente_email: body.cliente_email,
      cliente_whatsapp: body.cliente_whatsapp,
      data_hora_inicio: body.data_hora_inicio,
      data_hora_fim: fim.toISOString(),
      status: "CONFIRMADO",
      notas_internas: null,
      created_at: new Date().toISOString(),
    }

    const existing = agendaStore.get(dateStr) ?? []
    agendaStore.set(dateStr, [...existing, novo])
    return HttpResponse.json(novo, { status: 201 })
  }),

  http.patch("/api/admin/:slug/agenda/:id/cancelar", ({ params }) => {
    const id = Array.isArray(params.id) ? params.id[0] : params.id
    for (const [date, list] of agendaStore) {
      const idx = list.findIndex((a) => a.id === id)
      if (idx !== -1) {
        list[idx] = { ...list[idx], status: "CANCELADO" }
        agendaStore.set(date, [...list])
        return HttpResponse.json(list[idx])
      }
    }
    return new HttpResponse(null, { status: 404 })
  }),

  http.patch("/api/admin/:slug/agenda/:id/confirmar", ({ params }) => {
    const id = Array.isArray(params.id) ? params.id[0] : params.id
    for (const [date, list] of agendaStore) {
      const idx = list.findIndex((a) => a.id === id)
      if (idx !== -1) {
        list[idx] = { ...list[idx], status: "CONFIRMADO" }
        agendaStore.set(date, [...list])
        return HttpResponse.json(list[idx])
      }
    }
    return new HttpResponse(null, { status: 404 })
  }),

  // Admin slots — same availability logic as public, but skips existing bookings
  http.get("/api/admin/:slug/slots", ({ request }) => {
    const url = new URL(request.url)
    const dateStr = url.searchParams.get("date") ?? ""
    const date = new Date(dateStr + "T12:00:00")
    const dayOfWeek = date.getDay()
    const allSlots = generateSlots(dayOfWeek, disponibilidade.intervalo_atendimento_minutos)
    return HttpResponse.json(allSlots)
  }),

  // Serviços
  http.get("/api/admin/:slug/servicos", () => {
    return HttpResponse.json([...servicos])
  }),

  http.post("/api/admin/:slug/servicos", async ({ request }) => {
    const body = (await request.json()) as Omit<Servico, "id">
    const novo: Servico = { ...body, id: `svc-${Date.now()}` }
    servicos.push(novo)
    return HttpResponse.json(novo)
  }),

  http.put("/api/admin/:slug/servicos/:id", async ({ params, request }) => {
    const id = Array.isArray(params.id) ? params.id[0] : params.id
    const body = (await request.json()) as Partial<Servico>
    const idx = servicos.findIndex((s) => s.id === id)
    if (idx === -1) return new HttpResponse(null, { status: 404 })
    servicos[idx] = { ...servicos[idx], ...body }
    return HttpResponse.json(servicos[idx])
  }),

  http.delete("/api/admin/:slug/servicos/:id", ({ params }) => {
    const id = Array.isArray(params.id) ? params.id[0] : params.id
    const idx = servicos.findIndex((s) => s.id === id)
    if (idx !== -1) servicos.splice(idx, 1)
    return new HttpResponse(null, { status: 204 })
  }),

  // Disponibilidade
  http.get("/api/admin/:slug/disponibilidade", () => {
    return HttpResponse.json(disponibilidade)
  }),

  http.put("/api/admin/:slug/disponibilidade", async ({ request }) => {
    const body = (await request.json()) as Disponibilidade
    disponibilidade.intervalo_atendimento_minutos = body.intervalo_atendimento_minutos
    disponibilidade.dias = body.dias
    disponibilidade.bloqueios = body.bloqueios
    return HttpResponse.json({ ...disponibilidade })
  }),
]
