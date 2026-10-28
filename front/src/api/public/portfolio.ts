import { apiClient } from "@/api/client"
import type { PortfolioImagem } from "@/types/portfolio"
export async function getPortfolioPublico(slug: string) { const { data } = await apiClient.get<PortfolioImagem[]>(`/api/public/${slug}/portfolio`); return data }
