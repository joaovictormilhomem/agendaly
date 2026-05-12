import vine from '@vinejs/vine'

const hexColor = () => vine.string().regex(/^#[0-9A-Fa-f]{6}$/)

export const updatePerfilValidator = vine.compile(
  vine.object({
    logo_url: vine.string().url().maxLength(500).optional().nullable(),
    nome_exibicao: vine.string().minLength(1).maxLength(150).optional().nullable(),
    tagline: vine.string().maxLength(255).optional().nullable(),
    nome_profissional: vine.string().minLength(1).maxLength(150).optional().nullable(),
    especialidade: vine.string().maxLength(100).optional().nullable(),
    hero_titulo: vine.string().maxLength(255).optional().nullable(),
    hero_titulo_destaque: vine.string().maxLength(255).optional().nullable(),
    hero_subtitulo: vine.string().optional().nullable(),
    banner_titulo: vine.string().maxLength(255).optional().nullable(),
    banner_subtitulo: vine.string().maxLength(255).optional().nullable(),
    endereco: vine.string().maxLength(255).optional().nullable(),
    instagram: vine.string().maxLength(100).optional().nullable(),
    whatsapp: vine.string().maxLength(20).optional().nullable(),
    cor_principal: hexColor().optional(),
    cor_secundaria: hexColor().optional(),
  })
)
