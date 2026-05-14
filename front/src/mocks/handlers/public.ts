import { http, HttpResponse } from "msw"
import { perfilMock } from "@/mocks/fixtures/perfil"
import { servicosMock } from "@/mocks/fixtures/servicos"
import { disponibilidadeMock } from "@/mocks/fixtures/disponibilidade"
import { agendamentosPorDia } from "@/mocks/fixtures/agendamentos"

function generateSlots(dayOfWeek: number, intervalMinutes: number): { hora: string; disponivel: boolean }[] {
  const dia = disponibilidadeMock.dias.find((d) => d.dia === dayOfWeek)
  if (!dia || !dia.ativo) return []

  const slots: { hora: string; disponivel: boolean }[] = []
  for (const intervalo of dia.intervalos) {
    const [startH, startM] = intervalo.hora_inicio.split(":").map(Number)
    const [endH, endM] = intervalo.hora_fim.split(":").map(Number)
    let current = startH * 60 + startM
    const end = endH * 60 + endM
    while (current < end) {
      const h = Math.floor(current / 60).toString().padStart(2, "0")
      const m = (current % 60).toString().padStart(2, "0")
      slots.push({ hora: `${h}:${m}`, disponivel: true })
      current += intervalMinutes
    }
  }
  return slots
}

export const publicHandlers = [
  http.get("*/api/public/:slug/perfil", ({ params }) => {
    return HttpResponse.json({ ...perfilMock, slug: params.slug as string })
  }),

  http.get("*/api/public/:slug/servicos", () => {
    return HttpResponse.json(servicosMock)
  }),

  http.get("*/api/public/:slug/slots", ({ request }) => {
    const url = new URL(request.url)
    const dateStr = url.searchParams.get("data") ?? url.searchParams.get("date")
    const servicoId = url.searchParams.get("servicoId")
    if (!dateStr || !servicoId) return HttpResponse.json([], { status: 400 })

    const date = new Date(dateStr + "T12:00:00")
    const dayOfWeek = date.getDay()
    const slots = generateSlots(dayOfWeek, disponibilidadeMock.intervalo_atendimento_minutos)
    return HttpResponse.json(slots)
  }),

  http.post("*/api/public/:slug/agendar", async ({ request }) => {
    const body = (await request.json()) as {
      servicoId: string
      slot_datetime: string
      cliente_nome: string
      cliente_whatsapp: string
      cliente_email?: string
    }
    const dateStr = body.slot_datetime.slice(0, 10)
    const list = agendamentosPorDia.get(dateStr) ?? []
    const taken = list.some(
      (a) =>
        a.status === "CONFIRMADO" &&
        new Date(a.data_hora_inicio).getTime() === new Date(body.slot_datetime).getTime()
    )
    if (taken) {
      return HttpResponse.json(
        { mensagem: "Horário não está mais disponível.", slots_sugeridos: ["15:00", "15:30", "16:00"] },
        { status: 409 }
      )
    }
    return HttpResponse.json({ agendamento_id: `ag-${Date.now()}`, status: "PENDENTE" }, { status: 201 })
  }),
]
