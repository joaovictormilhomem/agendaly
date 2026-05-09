import { apiClient } from "@/api/client"
import type { Perfil, PerfilUpdate } from "@/types/perfil"

export async function getPerfil(slug: string): Promise<Perfil> {
  const { data } = await apiClient.get<Perfil>(`/api/admin/${slug}/perfil`)
  return data
}

export async function updatePerfil(slug: string, body: PerfilUpdate): Promise<Perfil> {
  const { data } = await apiClient.put<Perfil>(`/api/admin/${slug}/perfil`, body)
  return data
}
