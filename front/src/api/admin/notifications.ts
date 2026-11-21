import { apiClient } from "@/api/client"

interface UserNotification {
  id: string
  kind: "BOOKING_CREATED" | "SUPPORT_STATUS_CHANGED"
  target_id: string
  description: string
  created_at: string
}

export async function getNotifications(signal: AbortSignal) {
  const { data } = await apiClient.get<{ items: UserNotification[]; unread: number }>(
    "/api/me/notifications",
    { signal, skipAuthRefresh: true }
  )
  return data
}

export async function markNotificationsRead(id?: string) {
  await apiClient.patch("/api/me/notifications/read", { id })
}
