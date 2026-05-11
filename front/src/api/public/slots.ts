import { apiClient } from "@/api/client"
import { format } from "date-fns"

export async function getSlotsDisponiveis(slug: string, date: Date): Promise<string[]> {
  const { data } = await apiClient.get<string[]>(`/api/public/${slug}/slots`, {
    params: { date: format(date, "yyyy-MM-dd") },
  })
  return data
}
