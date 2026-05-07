import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { AuthUser } from "@/types/auth"
import type { Profissional } from "@/types/profissional"

interface ImpersonationState {
  originalToken: string
  originalUser: AuthUser
  target: Profissional
}

interface AuthState {
  token: string | null
  user: AuthUser | null
  impersonating: ImpersonationState | null

  login: (token: string, user: AuthUser) => void
  logout: () => void
  startImpersonation: (target: Profissional, secondaryToken: string) => void
  stopImpersonation: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      impersonating: null,

      login: (token, user) => set({ token, user, impersonating: null }),

      logout: () => set({ token: null, user: null, impersonating: null }),

      startImpersonation: (target, secondaryToken) => {
        const { token, user } = get()
        if (!token || !user) return
        set({
          impersonating: { originalToken: token, originalUser: user, target },
          token: secondaryToken,
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
          user: impersonating.originalUser,
          impersonating: null,
        })
      },
    }),
    {
      name: "agendaly-auth",
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        impersonating: state.impersonating,
      }),
    }
  )
)
