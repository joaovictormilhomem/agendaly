import { apiClient } from "../client"
import type { CreateProfissionalRequest, ImpersonateResponse, Profissional } from "@/types/profissional"

export async function listProfissionais(): Promise<Profissional[]> {
  const res = await apiClient.get<Profissional[]>("/api/master/profissional")
  return res.data
}

export async function createProfissional(data: CreateProfissionalRequest): Promise<Profissional> {
  const res = await apiClient.post<Profissional>("/api/master/profissional", data)
  return res.data
}

export async function impersonateProfissional(slug: string): Promise<ImpersonateResponse> {
  const res = await apiClient.post<ImpersonateResponse>(`/api/master/impersonate/${slug}`)
  return res.data
}
