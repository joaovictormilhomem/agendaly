import { apiClient } from "./client"
import type { LoginRequest, LoginResponse } from "@/types/auth"

export async function loginUser(data: LoginRequest): Promise<LoginResponse> {
  const res = await apiClient.post<LoginResponse>("/api/login", data)
  return res.data
}
