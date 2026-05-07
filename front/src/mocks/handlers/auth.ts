import { http, HttpResponse } from "msw"
import type { LoginResponse } from "@/types/auth"

const MOCK_USERS = [
  {
    email: "admin@agendaly.com",
    senha: "Admin1234",
    user: { id: "super-001", nome: "Admin", email: "admin@agendaly.com", role: "SUPERADMIN" as const, slug: "" },
    token: "mock-token-superadmin",
  },
  {
    email: "profissional@naile.com",
    senha: "Profissional1",
    user: { id: "uuid-001", nome: "Nailê Sousa", email: "profissional@naile.com", role: "PROFISSIONAL" as const, slug: "naile-studio" },
    token: "mock-token-profissional",
  },
]

export const authHandlers = [
  http.post("/api/login", async ({ request }) => {
    const body = await request.json() as { email: string; senha: string }
    const match = MOCK_USERS.find((u) => u.email === body.email && u.senha === body.senha)
    if (!match) {
      return HttpResponse.json({ message: "Credenciais inválidas" }, { status: 401 })
    }
    return HttpResponse.json<LoginResponse>({ token: match.token, user: match.user })
  }),
]
