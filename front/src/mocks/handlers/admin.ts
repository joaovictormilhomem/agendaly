import { http, HttpResponse } from "msw"
import { dashboardMock } from "@/mocks/fixtures/agendamentos"
import { perfilMock } from "@/mocks/fixtures/perfil"
import { disponibilidadeMock } from "@/mocks/fixtures/disponibilidade"
import { servicosMock } from "@/mocks/fixtures/servicos"
import type { Servico } from "@/types/servico"
import type { Disponibilidade } from "@/types/disponibilidade"

// Mutable in-place arrays — same pattern as masterHandlers
const servicos: Servico[] = servicosMock.map((s) => ({ ...s }))
const disponibilidade: Disponibilidade = {
  ...disponibilidadeMock,
  dias: disponibilidadeMock.dias.map((d) => ({ ...d, intervalos: d.intervalos.map((i) => ({ ...i })) })),
  bloqueios: disponibilidadeMock.bloqueios.map((b) => ({ ...b })),
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
