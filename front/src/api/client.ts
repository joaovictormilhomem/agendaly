import axios from "axios"
import { useAuthStore } from "@/store/authStore"

declare module "axios" {
  interface AxiosRequestConfig {
    skipAuthRefresh?: boolean
  }
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000"

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
})

export function resolveApiAssetUrl(url: string) {
  return url.startsWith("/api/") ? apiClient.getUri({ url }) : url
}

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

    if (
      error.response?.status === 401 &&
      store.token &&
      store.user &&
      !store.impersonating &&
      originalRequest?.headers?.Authorization === `Bearer ${store.token}` &&
      !originalRequest.skipAuthRefresh &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true

      try {
        const { data } = await axios.post<{ token: string }>(
          `${BASE_URL}/api/refresh`,
          { user_id: store.user.id },
          { headers: { "Content-Type": "application/json" }, withCredentials: true }
        )
        if (useAuthStore.getState().token !== store.token) return Promise.reject(error)
        store.setToken(data.token)
        originalRequest.headers.Authorization = `Bearer ${data.token}`
        return apiClient(originalRequest)
      } catch {
        if (useAuthStore.getState().token === store.token) {
          store.logout()
          window.location.href = "/login"
        }
        return Promise.reject(error)
      }
    }

    return Promise.reject(error)
  }
)
