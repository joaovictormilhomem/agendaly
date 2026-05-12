import type Configuracao from '#models/configuracao'

export function serializePerfil(config: Configuracao, slug: string) {
  return {
    slug,
    logo_url: config.logoUrl ?? '',
    nome_exibicao: config.nomeExibicao ?? '',
    tagline: config.tagline ?? '',
    nome_profissional: config.nomeProfissional ?? '',
    especialidade: config.especialidade ?? '',
    hero_titulo: config.heroTitulo ?? '',
    hero_titulo_destaque: config.heroTituloDestaque ?? '',
    hero_subtitulo: config.heroSubtitulo ?? '',
    banner_titulo: config.bannerTitulo ?? '',
    banner_subtitulo: config.bannerSubtitulo ?? '',
    endereco: config.endereco ?? '',
    instagram: config.instagram ?? '',
    whatsapp: config.whatsapp ?? '',
    cor_principal: config.corPrincipal,
    cor_secundaria: config.corSecundaria,
    primeira_visita: config.primeiraVisita,
  }
}

export function defaultPerfil(slug: string) {
  return {
    slug,
    logo_url: '',
    nome_exibicao: '',
    tagline: '',
    nome_profissional: '',
    especialidade: '',
    hero_titulo: '',
    hero_titulo_destaque: '',
    hero_subtitulo: '',
    banner_titulo: '',
    banner_subtitulo: '',
    endereco: '',
    instagram: '',
    whatsapp: '',
    cor_principal: '#D4788A',
    cor_secundaria: '#F2C4CE',
    primeira_visita: true,
  }
}
