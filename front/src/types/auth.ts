export type UserRole = "SUPERADMIN" | "PROFISSIONAL"

export interface AuthUser {
  id: string
  nome: string
  email: string
  role: UserRole
  slug: string
}

export interface LoginRequest {
  email: string
  senha: string
}

export interface LoginResponse {
  token: string
  refresh_token: string
  user: AuthUser
}
