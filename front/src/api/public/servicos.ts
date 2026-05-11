import { apiClient } from "@/api/client"
import type { Servico } from "@/types/servico"

export async function getServicosPublicos(slug: string): Promise<Servico[]> {
  const { data } = await apiClient.get<Servico[]>(`/api/public/${slug}/servicos`)
  return data
}
