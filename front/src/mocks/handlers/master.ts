import { http, HttpResponse } from "msw"
import type { Profissional, ImpersonateResponse } from "@/types/profissional"
import { profissionaisMock } from "@/mocks/fixtures/profissionais"

const db = [...profissionaisMock]

export const masterHandlers = [
  http.get("/api/users", () => {
    // Return backend shape (name, not nome) — mapBackendUser handles conversion
    return HttpResponse.json(db.map((p) => ({ ...p, name: p.nome })))
  }),

  http.post("/api/users", async ({ request }) => {
    const body = await request.json() as { name: string; email: string; slug: string; password: string; role: string }
    if (db.find((p) => p.email === body.email)) {
      return HttpResponse.json({ message: "Email já cadastrado" }, { status: 409 })
    }
    if (db.find((p) => p.slug === body.slug)) {
      return HttpResponse.json({ message: "Slug já em uso" }, { status: 409 })
    }
    const novo: Profissional = {
      id: `uuid-${Date.now()}`,
      nome: body.name,
      email: body.email,
      slug: body.slug,
      role: "PROFISSIONAL",
      created_at: new Date().toISOString(),
    }
    db.push(novo)
    return HttpResponse.json({ ...novo, name: novo.nome }, { status: 201 })
  }),

  http.post("/api/users/impersonate/:slug", ({ params }) => {
    const profissional = db.find((p) => p.slug === params.slug)
    if (!profissional) {
      return HttpResponse.json({ message: "Profissional não encontrada" }, { status: 404 })
    }
    return HttpResponse.json<ImpersonateResponse>({
      token: `mock-impersonate-${profissional.slug}`,
    })
  }),
]
