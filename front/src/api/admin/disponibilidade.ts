import { apiClient } from "@/api/client"
import type { Disponibilidade } from "@/types/disponibilidade"

export async function getDisponibilidade(slug: string): Promise<Disponibilidade> {
  const { data } = await apiClient.get<Disponibilidade>(`/api/admin/${slug}/disponibilidade`)
  return data
}

export async function updateDisponibilidade(slug: string, body: Disponibilidade): Promise<Disponibilidade> {
  const { data } = await apiClient.put<Disponibilidade>(`/api/admin/${slug}/disponibilidade`, body)
  return data
}
