export interface Profissional {
  id: string
  nome: string
  email: string
  slug: string
  role: "SUPERADMIN" | "PROFISSIONAL"
  created_at: string
}

export interface CreateProfissionalRequest {
  nome: string
  email: string
  slug: string
  senha: string
  whatsapp_contato: string
}

export interface ImpersonateResponse {
  token: string
  profissional: Profissional
}
