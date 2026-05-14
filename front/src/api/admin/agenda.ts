import { apiClient } from "../client"
import { format } from "date-fns"
import type {
  DashboardData,
  Agendamento,
  AgendaListResponse,
  AgendamentoManualCreate,
  AgendaStatusPatch,
} from "@/types/agenda"

export async function getDashboard(slug: string): Promise<DashboardData> {
  const res = await apiClient.get<DashboardData>(`/api/admin/${slug}/dashboard`)
  return res.data
}

export async function getAgendaDay(slug: string, date: Date): Promise<AgendaListResponse> {
  const { data } = await apiClient.get<AgendaListResponse>(`/api/admin/${slug}/agenda`, {
    params: { data: format(date, "yyyy-MM-dd") },
  })
  return data
}

export async function getAgendaRange(slug: string, dataInicio: Date, dataFim: Date): Promise<AgendaListResponse> {
  const { data } = await apiClient.get<AgendaListResponse>(`/api/admin/${slug}/agenda`, {
    params: {
      data_inicio: format(dataInicio, "yyyy-MM-dd"),
      data_fim: format(dataFim, "yyyy-MM-dd"),
    },
  })
  return data
}

export async function getAgendamento(slug: string, id: string): Promise<Agendamento & { created_at?: string }> {
  const { data } = await apiClient.get<Agendamento & { created_at?: string }>(`/api/admin/${slug}/agenda/${id}`)
  return data
}

export async function createAgendamentoManual(
  slug: string,
  body: AgendamentoManualCreate
): Promise<Agendamento> {
  const { data } = await apiClient.post<Agendamento>(`/api/admin/${slug}/agenda/manual`, body)
  return data
}

export async function patchAgendamentoStatus(
  slug: string,
  id: string,
  body: AgendaStatusPatch
): Promise<Agendamento> {
  const { data } = await apiClient.patch<Agendamento>(`/api/admin/${slug}/agenda/${id}/status`, body)
  return data
}

export async function getAdminSlots(slug: string, date: Date, servicoId: string): Promise<string[]> {
  const { data } = await apiClient.get<string[]>(`/api/admin/${slug}/slots`, {
    params: { data: format(date, "yyyy-MM-dd"), servicoId },
  })
  return data
}
