import { apiClient, resolveApiAssetUrl } from "@/api/client"
import type { Perfil, PerfilUpdate } from "@/types/perfil"

export async function getPerfil(slug: string): Promise<Perfil> {
  const { data } = await apiClient.get<Perfil>(`/api/admin/${slug}/perfil`)
  return { ...data, logo_url: resolveApiAssetUrl(data.logo_url) }
}

export async function updatePerfil(slug: string, body: PerfilUpdate, imagem?: File | null): Promise<Perfil> {
  const url = `/api/admin/${slug}/perfil`
  if (imagem) {
    const form = new FormData()
    for (const [key, value] of Object.entries(body)) form.append(key, value)
    form.append("imagem", imagem)
    const { data } = await apiClient.put<Perfil>(url, form, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    return { ...data, logo_url: resolveApiAssetUrl(data.logo_url) }
  }

  const { data } = await apiClient.put<Perfil>(url, imagem === null ? { ...body, remover_logo: true } : body)
  return { ...data, logo_url: resolveApiAssetUrl(data.logo_url) }
}
