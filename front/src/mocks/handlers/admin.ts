import { http, HttpResponse } from "msw"
import { dashboardMock } from "@/mocks/fixtures/agendamentos"

export const adminHandlers = [
  http.get("/api/admin/:slug/dashboard", () => {
    return HttpResponse.json(dashboardMock)
  }),
]
