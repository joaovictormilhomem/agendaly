import { useAuthStore } from "@/store/authStore"

export function useAuth() {
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)
  const impersonating = useAuthStore((s) => s.impersonating)
  const login = useAuthStore((s) => s.login)
  const logout = useAuthStore((s) => s.logout)
  const startImpersonation = useAuthStore((s) => s.startImpersonation)
  const stopImpersonation = useAuthStore((s) => s.stopImpersonation)

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
