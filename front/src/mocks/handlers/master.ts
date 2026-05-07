import { http, HttpResponse } from "msw"
import type { Profissional, ImpersonateResponse } from "@/types/profissional"
import { profissionaisMock } from "@/mocks/fixtures/profissionais"

const db = [...profissionaisMock]

export const masterHandlers = [
  http.get("/api/master/profissional", () => {
    return HttpResponse.json<Profissional[]>(db)
  }),

  http.post("/api/master/profissional", async ({ request }) => {
    const body = await request.json() as { nome: string; email: string; slug: string; senha: string; whatsapp_contato: string }
    if (db.find((p) => p.email === body.email)) {
      return HttpResponse.json({ message: "Email já cadastrado" }, { status: 409 })
    }
    if (db.find((p) => p.slug === body.slug)) {
      return HttpResponse.json({ message: "Slug já em uso" }, { status: 409 })
    }
    const novo: Profissional = {
      id: `uuid-${Date.now()}`,
      nome: body.nome,
      email: body.email,
      slug: body.slug,
      role: "PROFISSIONAL",
      created_at: new Date().toISOString(),
    }
    db.push(novo)
    return HttpResponse.json(novo, { status: 201 })
  }),

  http.post("/api/master/impersonate/:slug", ({ params }) => {
    const profissional = db.find((p) => p.slug === params.slug)
    if (!profissional) {
      return HttpResponse.json({ message: "Profissional não encontrada" }, { status: 404 })
    }
    return HttpResponse.json<ImpersonateResponse>({
      token: `mock-impersonate-${profissional.slug}`,
      profissional,
    })
  }),
]
