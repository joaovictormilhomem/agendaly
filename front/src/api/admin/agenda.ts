import { apiClient } from "../client"
import { format } from "date-fns"
import type { DashboardData, Agendamento, AgendamentoCreate } from "@/types/agenda"

export async function getDashboard(slug: string): Promise<DashboardData> {
  const res = await apiClient.get<DashboardData>(`/api/admin/${slug}/dashboard`)
  return res.data
}

export async function getAgenda(slug: string, date: Date): Promise<Agendamento[]> {
  const { data } = await apiClient.get<Agendamento[]>(`/api/admin/${slug}/agenda`, {
    params: { date: format(date, "yyyy-MM-dd") },
  })
  return data
}

export async function createAgendamento(slug: string, body: AgendamentoCreate): Promise<Agendamento> {
  const { data } = await apiClient.post<Agendamento>(`/api/admin/${slug}/agenda`, body)
  return data
}

export async function cancelarAgendamento(slug: string, id: string): Promise<Agendamento> {
  const { data } = await apiClient.patch<Agendamento>(`/api/admin/${slug}/agenda/${id}/cancelar`)
  return data
}

export async function confirmarAgendamento(slug: string, id: string): Promise<Agendamento> {
  const { data } = await apiClient.patch<Agendamento>(`/api/admin/${slug}/agenda/${id}/confirmar`)
  return data
}

export async function getAdminSlots(slug: string, date: Date, servicoId: string): Promise<string[]> {
  const { data } = await apiClient.get<string[]>(`/api/admin/${slug}/slots`, {
    params: { date: format(date, "yyyy-MM-dd"), servico_id: servicoId },
  })
  return data
}
