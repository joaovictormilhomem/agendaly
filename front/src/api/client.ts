import axios from "axios"
import { useAuthStore } from "@/store/authStore"

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000"

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
})

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const store = useAuthStore.getState()
    const originalRequest = error.config

    if (error.response?.status === 401 && store.token && !originalRequest._retry) {
      if (!store.refreshToken) {
        store.logout()
        window.location.href = "/login"
        return Promise.reject(error)
      }

      originalRequest._retry = true

      try {
        const { data } = await axios.post<{ token: string; refresh_token: string }>(
          `${BASE_URL}/api/refresh`,
          { refresh_token: store.refreshToken },
          { headers: { "Content-Type": "application/json" } }
        )
        store.setTokens(data.token, data.refresh_token)
        originalRequest.headers.Authorization = `Bearer ${data.token}`
        return apiClient(originalRequest)
      } catch {
        store.logout()
        window.location.href = "/login"
        return Promise.reject(error)
      }
    }

    return Promise.reject(error)
  }
)
