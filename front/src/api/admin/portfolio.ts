import { apiClient } from "@/api/client"
import type { PortfolioImagem } from "@/types/portfolio"
export async function getPortfolio(slug: string) { const { data } = await apiClient.get<PortfolioImagem[]>(`/api/admin/${slug}/portfolio`); return data }
export async function uploadImagemPortfolio(slug: string, imagem: File) {
  const form = new FormData()
  form.append("imagem", imagem)
  const { data } = await apiClient.post<PortfolioImagem>(`/api/admin/${slug}/portfolio`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  })
  return data
}
export async function excluirImagemPortfolio(slug: string, id: string) { await apiClient.delete(`/api/admin/${slug}/portfolio/${id}`) }
