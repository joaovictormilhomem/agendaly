import axios from "axios"
import { apiClient } from "./client"
import type { LoginRequest, LoginResponse, UserRole } from "@/types/auth"

interface BackendLoginResponse {
  token: string
  refresh_token: string
}

interface BackendMeResponse {
  id: string
  role: string
  slug: string
  email: string
  name: string
}

export async function loginUser(data: LoginRequest): Promise<LoginResponse> {
  const res = await apiClient.post<BackendLoginResponse>("/api/login", {
    email: data.email,
    password: data.senha,
  })
  const { token, refresh_token } = res.data

  const meRes = await axios.get<BackendMeResponse>(
    `${import.meta.env.VITE_API_BASE_URL || ""}/api/me`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  )
  const { id, role, slug, email, name } = meRes.data

  return {
    token,
    refresh_token,
    user: { id, nome: name, email, role: role as UserRole, slug },
  }
}

export async function logoutApi(refreshToken?: string): Promise<void> {
  await apiClient.post("/api/logout", { refresh_token: refreshToken })
}
