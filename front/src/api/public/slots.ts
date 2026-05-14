import { apiClient } from "@/api/client"
import { format } from "date-fns"
import type { PublicSlotItem } from "@/types/agenda"

export async function getSlotsDisponiveis(
  slug: string,
  date: Date,
  servicoId: string
): Promise<PublicSlotItem[]> {
  const { data } = await apiClient.get<PublicSlotItem[]>(`/api/public/${slug}/slots`, {
    params: { data: format(date, "yyyy-MM-dd"), servicoId },
  })
  return data
}
