import { http, HttpResponse } from "msw"
import { dashboardMock } from "@/mocks/fixtures/agendamentos"
import { perfilMock } from "@/mocks/fixtures/perfil"

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
]
