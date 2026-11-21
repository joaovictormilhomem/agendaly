import { apiClient, resolveApiAssetUrl } from "@/api/client"
import type { Perfil } from "@/types/perfil"

export async function getPerfilPublico(slug: string): Promise<Perfil> {
  const { data } = await apiClient.get<Perfil>(`/api/public/${slug}/perfil`)
  return { ...data, logo_url: resolveApiAssetUrl(data.logo_url) }
}
