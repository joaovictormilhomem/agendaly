import { http, HttpResponse } from "msw"

const MOCK_USERS = [
  {
    email: "admin@agendaly.com",
    password: "Admin1234",
    token: "mock-token-superadmin",
    me: { id: "super-001", name: "Admin", email: "admin@agendaly.com", role: "SUPERADMIN", slug: "" },
  },
  {
    email: "profissional@naile.com",
    password: "Profissional1",
    token: "mock-token-profissional",
    me: { id: "uuid-001", name: "Nailê Sousa", email: "profissional@naile.com", role: "PROFISSIONAL", slug: "naile-studio" },
  },
]

export const authHandlers = [
  http.post("/api/login", async ({ request }) => {
    const body = await request.json() as { email: string; password: string }
    const match = MOCK_USERS.find((u) => u.email === body.email && u.password === body.password)
    if (!match) {
      return HttpResponse.json({ message: "Credenciais inválidas" }, { status: 401 })
    }
    return HttpResponse.json({ token: match.token, refresh_token: `mock-refresh-${match.token}` })
  }),

  http.get("/api/me", ({ request }) => {
    const authHeader = request.headers.get("authorization") || request.headers.get("Authorization")
    const token = authHeader?.replace("Bearer ", "")
    const match = MOCK_USERS.find((u) => u.token === token)
    if (!match) {
      console.warn(`[MSW] /api/me: no match for token "${token}", auth header: "${authHeader}"`)
      return HttpResponse.json({ message: "Unauthorized" }, { status: 401 })
    }
    return HttpResponse.json(match.me)
  }),

  http.post("/api/logout", () => {
    return HttpResponse.json({ message: "Logout efetuado" })
  }),

  http.post("/api/refresh", ({ request: _req }) => {
    return HttpResponse.json({ token: "mock-token-refreshed", refresh_token: "mock-refresh-refreshed" })
  }),
]
