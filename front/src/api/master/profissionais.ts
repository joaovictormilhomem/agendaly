import { apiClient } from "../client"
import type { CreateProfissionalRequest, ImpersonateResponse, Profissional } from "@/types/profissional"

interface BackendUser {
  id: string
  name: string
  email: string
  slug: string
  role: "SUPERADMIN" | "PROFISSIONAL"
  created_at: string
}

function mapBackendUser(user: BackendUser): Profissional {
  return {
    id: user.id,
    nome: user.name,
    email: user.email,
    slug: user.slug,
    role: user.role,
    created_at: user.created_at,
  }
}

export async function listProfissionais(): Promise<Profissional[]> {
  const res = await apiClient.get<BackendUser[]>("/api/users")
  return res.data.map(mapBackendUser)
}

export async function createProfissional(data: CreateProfissionalRequest): Promise<Profissional> {
  const res = await apiClient.post<BackendUser>("/api/users", {
    name: data.nome,
    email: data.email,
    password: data.senha,
    slug: data.slug,
    role: "PROFISSIONAL",
  })
  return mapBackendUser(res.data)
}

export async function impersonateProfissional(slug: string): Promise<ImpersonateResponse> {
  const res = await apiClient.post<ImpersonateResponse>(`/api/users/impersonate/${slug}`)
  return res.data
}
