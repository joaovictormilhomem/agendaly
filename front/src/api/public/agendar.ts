import { apiClient } from "@/api/client"
import type { AgendarPublicBody, AgendarPublicResponse, AgendarConflictResponse } from "@/types/agenda"
import { isAxiosError } from "axios"

export async function agendarPublico(
  slug: string,
  body: AgendarPublicBody
): Promise<AgendarPublicResponse> {
  const { data } = await apiClient.post<AgendarPublicResponse>(`/api/public/${slug}/agendar`, body)
  return data
}

export function parseAgendarConflict(err: unknown): AgendarConflictResponse | null {
  if (!isAxiosError(err)) return null
  if (err.response?.status !== 409) return null
  const d = err.response.data as Partial<AgendarConflictResponse>
  if (d && typeof d.mensagem === "string" && Array.isArray(d.slots_sugeridos)) {
    return { mensagem: d.mensagem, slots_sugeridos: d.slots_sugeridos }
  }
  return null
}
