import { apiClient } from "./client"

export interface TicketInput {
  subject: string
  description: string
}

export const ticketStatuses = {
  OPEN: "Aberto",
  IN_PROGRESS: "Em atendimento",
  WAITING_CUSTOMER: "Aguardando cliente",
  RESOLVED: "Resolvido",
} as const

export type TicketStatus = keyof typeof ticketStatuses

export interface SupportTicket extends TicketInput {
  id: string
  created_at: string
  updated_at: string
  status: TicketStatus
  unread_reply_id: string | null
  requester_name: string
  requester_email: string
  requester_slug: string | null
}

interface TicketReply {
  id: string
  author: "SUPPORT" | "CUSTOMER"
  body: string
  created_at: string
}

interface TicketDetail extends SupportTicket {
  replies: TicketReply[]
}

interface TicketPage {
  data: SupportTicket[]
  meta: { lastPage: number }
}

export async function createSupportTicket(ticket: TicketInput) {
  const { data } = await apiClient.post<{ id: string }>("/api/support/tickets", ticket)
  return data
}

export async function listSupportTickets(page: number, staff: boolean, status?: TicketStatus) {
  const path = staff ? "/api/support/tickets" : "/api/support/tickets/mine"
  const { data } = await apiClient.get<TicketPage>(path, { params: { page, status } })
  return data
}

export async function getSupportTicket(id: string) {
  const { data } = await apiClient.get<TicketDetail>(`/api/support/tickets/${id}`)
  return data
}

export async function replyToSupportTicket(id: string, body: string) {
  await apiClient.post(`/api/support/tickets/${id}/replies`, { body })
}

export async function updateSupportTicketStatus(id: string, status: TicketStatus) {
  await apiClient.patch(`/api/support/tickets/${id}/status`, { status })
}

export async function getUnreadSupportTickets() {
  const { data } = await apiClient.get<{ unread: boolean }>("/api/support/tickets/unread")
  return data.unread
}

export async function markSupportTicketRead(id: string, replyId: string) {
  await apiClient.patch(`/api/support/tickets/${id}/read`, { replyId })
}
