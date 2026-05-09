export interface Perfil {
  slug: string
  logo_url: string
  nome_exibicao: string
  tagline: string
  nome_profissional: string
  especialidade: string
  hero_titulo: string
  hero_titulo_destaque: string
  hero_subtitulo: string
  banner_titulo: string
  banner_subtitulo: string
  endereco: string
  instagram: string
  whatsapp: string
  cor_principal: string
  cor_secundaria: string
  primeira_visita: boolean
}

export type PerfilUpdate = Omit<Perfil, "slug" | "primeira_visita">
