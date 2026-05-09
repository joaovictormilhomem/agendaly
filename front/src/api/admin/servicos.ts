import { apiClient } from "@/api/client"
import type { Servico, ServicoCreate, ServicoUpdate } from "@/types/servico"

export async function getServicos(slug: string): Promise<Servico[]> {
  const { data } = await apiClient.get<Servico[]>(`/api/admin/${slug}/servicos`)
  return data
}

export async function createServico(slug: string, body: ServicoCreate): Promise<Servico> {
  const { data } = await apiClient.post<Servico>(`/api/admin/${slug}/servicos`, body)
  return data
}

export async function updateServico(slug: string, id: string, body: ServicoUpdate): Promise<Servico> {
  const { data } = await apiClient.put<Servico>(`/api/admin/${slug}/servicos/${id}`, body)
  return data
}

export async function deleteServico(slug: string, id: string): Promise<void> {
  await apiClient.delete(`/api/admin/${slug}/servicos/${id}`)
}
