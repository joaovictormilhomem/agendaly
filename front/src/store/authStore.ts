import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { AuthUser } from "@/types/auth"
import type { Profissional } from "@/types/profissional"

interface ImpersonationState {
  originalToken: string
  originalRefreshToken: string | null
  originalUser: AuthUser
  target: Profissional
}

interface AuthState {
  token: string | null
  refreshToken: string | null
  user: AuthUser | null
  impersonating: ImpersonationState | null

  login: (token: string, refreshToken: string, user: AuthUser) => void
  setTokens: (token: string, refreshToken: string) => void
  logout: () => void
  startImpersonation: (target: Profissional, secondaryToken: string) => void
  stopImpersonation: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      refreshToken: null,
      user: null,
      impersonating: null,

      login: (token, refreshToken, user) => set({ token, refreshToken, user, impersonating: null }),

      setTokens: (token, refreshToken) => set({ token, refreshToken }),

      logout: () => set({ token: null, refreshToken: null, user: null, impersonating: null }),

      startImpersonation: (target, secondaryToken) => {
        const { token, refreshToken, user } = get()
        if (!token || !user) return
        set({
          impersonating: { originalToken: token, originalRefreshToken: refreshToken, originalUser: user, target },
          token: secondaryToken,
          refreshToken: null,
          user: {
            id: target.id,
            nome: target.nome,
            email: target.email,
            role: "PROFISSIONAL",
            slug: target.slug,
          },
        })
      },

      stopImpersonation: () => {
        const { impersonating } = get()
        if (!impersonating) return
        set({
          token: impersonating.originalToken,
          refreshToken: impersonating.originalRefreshToken,
          user: impersonating.originalUser,
          impersonating: null,
        })
      },
    }),
    {
      name: "agendaly-auth",
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        user: state.user,
        impersonating: state.impersonating,
      }),
    }
  )
)
