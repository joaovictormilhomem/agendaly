import { apiClient } from "@/api/client"
import type { Perfil } from "@/types/perfil"

export async function getPerfilPublico(slug: string): Promise<Perfil> {
  const { data } = await apiClient.get<Perfil>(`/api/public/${slug}/perfil`)
  return data
}
