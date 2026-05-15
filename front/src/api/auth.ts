import axios from "axios"
import { apiClient } from "./client"
import type { LoginRequest, LoginResponse, UserRole } from "@/types/auth"

interface BackendMeResponse {
  id: string
  role: string
  slug: string
  email: string
  name: string
}

export async function loginUser(data: LoginRequest): Promise<LoginResponse> {
  const res = await apiClient.post<{ token: string }>("/api/login", {
    email: data.email,
    password: data.senha,
  })
  const { token } = res.data

  const meRes = await axios.get<BackendMeResponse>(
    `${import.meta.env.VITE_API_BASE_URL || ""}/api/me`,
    { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
  )
  const { id, role, slug, email, name } = meRes.data

  return {
    token,
    user: { id, nome: name, email, role: role as UserRole, slug },
  }
}

export async function logoutApi(): Promise<void> {
  await apiClient.post("/api/logout")
}
