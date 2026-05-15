import { useAuthStore } from "@/store/authStore"
import { logoutApi } from "@/api/auth"

export function useAuth() {
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)
  const impersonating = useAuthStore((s) => s.impersonating)
  const login = useAuthStore((s) => s.login)
  const logoutStore = useAuthStore((s) => s.logout)
  const startImpersonation = useAuthStore((s) => s.startImpersonation)
  const stopImpersonation = useAuthStore((s) => s.stopImpersonation)

  async function logout() {
    await logoutApi().catch(() => {})
    logoutStore()
  }

  return {
    token,
    user,
    impersonating,
    isAuthenticated: !!token,
    isSuperAdmin: user?.role === "SUPERADMIN",
    login,
    logout,
    startImpersonation,
    stopImpersonation,
  }
}
