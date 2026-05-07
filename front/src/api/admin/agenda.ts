import { apiClient } from "../client"
import type { DashboardData } from "@/types/agenda"

export async function getDashboard(slug: string): Promise<DashboardData> {
  const res = await apiClient.get<DashboardData>(`/api/admin/${slug}/dashboard`)
  return res.data
}
