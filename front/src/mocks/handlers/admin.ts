import { http, HttpResponse } from "msw"
import { dashboardMock, agendamentosPorDia } from "@/mocks/fixtures/agendamentos"
import { perfilMock } from "@/mocks/fixtures/perfil"
import { disponibilidadeMock } from "@/mocks/fixtures/disponibilidade"
import { servicosMock } from "@/mocks/fixtures/servicos"
import type { Servico } from "@/types/servico"
import type { Disponibilidade } from "@/types/disponibilidade"
import type { Agendamento, AgendaListResponse, AgendamentoManualCreate } from "@/types/agenda"

const servicos: Servico[] = servicosMock.map((s) => ({ ...s }))
const disponibilidade: Disponibilidade = {
  ...disponibilidadeMock,
  dias: disponibilidadeMock.dias.map((d) => ({ ...d, intervalos: d.intervalos.map((i) => ({ ...i })) })),
  bloqueios: disponibilidadeMock.bloqueios.map((b) => ({ ...b })),
}

const agendaStore: Map<string, Agendamento[]> = new Map(
  Array.from(agendamentosPorDia.entries()).map(([k, v]) => [k, v.map((a) => structuredClone(a))])
)

function eachDateInRange(inicio: string, fim: string): string[] {
  const out: string[] = []
  const d = new Date(inicio + "T12:00:00")
  const end = new Date(fim + "T12:00:00")
  const cur = new Date(d)
  while (cur <= end) {
    out.push(cur.toISOString().slice(0, 10))
    cur.setDate(cur.getDate() + 1)
  }
  return out
}

function findAgendamentoById(id: string): Agendamento | undefined {
  for (const list of agendaStore.values()) {
    const hit = list.find((a) => a.id === id)
    if (hit) return structuredClone(hit)
  }
  return undefined
}

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
  http.get("*/api/admin/:slug/dashboard", () => {
    return HttpResponse.json(dashboardMock)
  }),

  http.get("*/api/admin/:slug/perfil", () => {
    return HttpResponse.json(perfilMock)
  }),

  http.put("*/api/admin/:slug/perfil", async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json({ ...perfilMock, ...(body as object) })
  }),

  http.get("*/api/admin/:slug/agenda", ({ request }) => {
    const url = new URL(request.url)
    const data = url.searchParams.get("data")
    const di = url.searchParams.get("data_inicio")
    const df = url.searchParams.get("data_fim")
    let inicioStr: string
    let fimStr: string
    if (di && df) {
      inicioStr = di
      fimStr = df
    } else if (data) {
      inicioStr = data
      fimStr = data
    } else {
      return HttpResponse.json({ message: "Informe data ou data_inicio e data_fim" }, { status: 400 })
    }
    const keys = eachDateInRange(inicioStr, fimStr)
    const list: Agendamento[] = []
    for (const k of keys) {
      list.push(...(agendaStore.get(k) ?? []).map((a) => structuredClone(a)))
    }
    list.sort((a, b) => a.data_hora_inicio.localeCompare(b.data_hora_inicio))
    const body: AgendaListResponse = {
      periodo: { inicio: inicioStr, fim: fimStr },
      agendamentos: list,
    }
    return HttpResponse.json(body)
  }),

  http.get("*/api/admin/:slug/agenda/:id", ({ params }) => {
    const id = Array.isArray(params.id) ? params.id[0] : params.id
    const ag = findAgendamentoById(id)
    if (!ag) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json({ ...ag, created_at: ag.created_at ?? new Date().toISOString() })
  }),

  http.post("*/api/admin/:slug/agenda/manual", async ({ request }) => {
    const body = (await request.json()) as AgendamentoManualCreate
    const dateStr = body.data_hora_inicio.slice(0, 10)
    const svc = servicos.find((s) => s.id === body.servicoId)
    const duracao = svc?.duracao_minutos ?? 60
    const inicio = new Date(body.data_hora_inicio)
    const fim = new Date(inicio.getTime() + duracao * 60000)

    const novo: Agendamento = {
      id: `ag-${Date.now()}`,
      cliente_nome: body.cliente_nome,
      cliente_email: body.cliente_email ?? "",
      cliente_whatsapp: body.cliente_whatsapp,
      servico: {
        nome: svc?.nome ?? "Serviço",
        emoji: svc?.emoji ?? "📅",
        duracao_minutos: duracao,
        preco: svc?.preco ?? 0,
      },
      data_hora_inicio: body.data_hora_inicio,
      data_hora_fim: fim.toISOString(),
      status: "CONFIRMADO",
      status_confirmacao: "manual_admin",
      notas_internas: body.notas_internas,
      created_at: new Date().toISOString(),
    }

    const existing = agendaStore.get(dateStr) ?? []
    agendaStore.set(dateStr, [...existing, novo])
    return HttpResponse.json(novo, { status: 201 })
  }),

  http.patch("*/api/admin/:slug/agenda/:id/status", async ({ params, request }) => {
    const id = Array.isArray(params.id) ? params.id[0] : params.id
    const patch = (await request.json()) as { status: string; motivo?: string }
    for (const [date, list] of agendaStore) {
      const idx = list.findIndex((a) => a.id === id)
      if (idx !== -1) {
        const next = { ...list[idx], status: patch.status as Agendamento["status"] }
        if (patch.status === "CONFIRMADO") {
          Object.assign(next, { status_confirmacao: "confirmado_cliente" })
        }
        list[idx] = next
        agendaStore.set(date, [...list])
        return HttpResponse.json(structuredClone(list[idx]))
      }
    }
    return new HttpResponse(null, { status: 404 })
  }),

  http.get("*/api/admin/:slug/slots", ({ request }) => {
    const url = new URL(request.url)
    const dateStr = url.searchParams.get("data") ?? ""
    const servicoId = url.searchParams.get("servicoId")
    if (!dateStr || !servicoId) return HttpResponse.json([], { status: 400 })
    const date = new Date(dateStr + "T12:00:00")
    const dayOfWeek = date.getDay()
    const allSlots = generateSlots(dayOfWeek, disponibilidade.intervalo_atendimento_minutos)
    const dayList = agendaStore.get(dateStr) ?? []
    const confirmed = dayList.filter((a) => a.status === "CONFIRMADO")
    const svc = servicos.find((s) => s.id === servicoId)
    const dur = svc?.duracao_minutos ?? 60
    const filtered = allSlots.filter((slot) => {
      const [h, m] = slot.split(":").map(Number)
      const start = new Date(dateStr + "T12:00:00")
      start.setHours(h, m, 0, 0)
      const end = new Date(start.getTime() + dur * 60000)
      for (const c of confirmed) {
        const cs = new Date(c.data_hora_inicio).getTime()
        const ce = new Date(c.data_hora_fim).getTime()
        if (start.getTime() < ce && end.getTime() > cs) return false
      }
      return true
    })
    return HttpResponse.json(filtered)
  }),

  http.get("*/api/admin/:slug/servicos", () => {
    return HttpResponse.json([...servicos])
  }),

  http.post("*/api/admin/:slug/servicos", async ({ request }) => {
    const body = (await request.json()) as Omit<Servico, "id">
    const novo: Servico = { ...body, id: `svc-${Date.now()}` }
    servicos.push(novo)
    return HttpResponse.json(novo)
  }),

  http.put("*/api/admin/:slug/servicos/:id", async ({ params, request }) => {
    const id = Array.isArray(params.id) ? params.id[0] : params.id
    const body = (await request.json()) as Partial<Servico>
    const idx = servicos.findIndex((s) => s.id === id)
    if (idx === -1) return new HttpResponse(null, { status: 404 })
    servicos[idx] = { ...servicos[idx], ...body }
    return HttpResponse.json(servicos[idx])
  }),

  http.delete("*/api/admin/:slug/servicos/:id", ({ params }) => {
    const id = Array.isArray(params.id) ? params.id[0] : params.id
    const idx = servicos.findIndex((s) => s.id === id)
    if (idx !== -1) servicos.splice(idx, 1)
    return new HttpResponse(null, { status: 204 })
  }),

  http.get("*/api/admin/:slug/disponibilidade", () => {
    return HttpResponse.json(disponibilidade)
  }),

  http.put("*/api/admin/:slug/disponibilidade", async ({ request }) => {
    const body = (await request.json()) as Disponibilidade
    disponibilidade.intervalo_atendimento_minutos = body.intervalo_atendimento_minutos
    disponibilidade.dias = body.dias
    disponibilidade.bloqueios = body.bloqueios
    return HttpResponse.json({ ...disponibilidade })
  }),
]
