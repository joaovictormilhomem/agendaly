import { http, HttpResponse } from "msw"
import { perfilMock } from "@/mocks/fixtures/perfil"
import { servicosMock } from "@/mocks/fixtures/servicos"
import { disponibilidadeMock } from "@/mocks/fixtures/disponibilidade"

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

export const publicHandlers = [
  http.get("/api/public/:slug/perfil", ({ params }) => {
    return HttpResponse.json({ ...perfilMock, slug: params.slug as string })
  }),

  http.get("/api/public/:slug/servicos", () => {
    return HttpResponse.json(servicosMock)
  }),

  http.get("/api/public/:slug/slots", ({ request }) => {
    const url = new URL(request.url)
    const dateStr = url.searchParams.get("date")
    if (!dateStr) return HttpResponse.json([], { status: 400 })

    const date = new Date(dateStr + "T12:00:00")
    const dayOfWeek = date.getDay()
    const slots = generateSlots(dayOfWeek, disponibilidadeMock.intervalo_atendimento_minutos)
    return HttpResponse.json(slots)
  }),
]
