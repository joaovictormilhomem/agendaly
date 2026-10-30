import { apiClient } from "@/api/client"
import type { WhatsappMensagensResponse } from "@/types/whatsapp"

export type WhatsappSessionPayload = {
  state: string
  qr_data_url: string | null
  error: string | null
}

export type WhatsappStatusResponse = WhatsappSessionPayload & {
  habilitado_no_servidor: boolean
}

export async function getWhatsappStatus(slug: string): Promise<WhatsappStatusResponse> {
  const { data } = await apiClient.get<WhatsappStatusResponse>(`/api/admin/${slug}/whatsapp/status`)
  return data
}

export async function postWhatsappConectar(slug: string): Promise<WhatsappSessionPayload> {
  const { data } = await apiClient.post<WhatsappSessionPayload>(`/api/admin/${slug}/whatsapp/conectar`)
  return data
}

export async function postWhatsappDesconectar(slug: string): Promise<void> {
  await apiClient.post(`/api/admin/${slug}/whatsapp/desconectar`)
}

export async function getWhatsappMensagens(slug: string, page = 1): Promise<WhatsappMensagensResponse> {
  const { data } = await apiClient.get<WhatsappMensagensResponse>(`/api/admin/${slug}/whatsapp/mensagens`, {
    params: { page, per_page: 20 },
  })
  return data
}
