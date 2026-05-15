import axios from "axios"
import { useAuthStore } from "@/store/authStore"

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000"

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
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
      originalRequest._retry = true

      try {
        const { data } = await axios.post<{ token: string }>(
          `${BASE_URL}/api/refresh`,
          {},
          { headers: { "Content-Type": "application/json" }, withCredentials: true }
        )
        store.setToken(data.token)
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
