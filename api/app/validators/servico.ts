import vine from '@vinejs/vine'

export const createServicoValidator = vine.compile(
  vine.object({
    nome: vine.string().minLength(1).maxLength(150),
    emoji: vine.string().minLength(1).maxLength(10),
    descricao: vine.string().optional().nullable(),
    duracao_minutos: vine.number().positive().withoutDecimals(),
    preco: vine.number().positive(),
    ativo: vine.boolean().optional(),
  })
)

export const updateServicoValidator = vine.compile(
  vine.object({
    nome: vine.string().minLength(1).maxLength(150).optional(),
    emoji: vine.string().minLength(1).maxLength(10).optional(),
    descricao: vine.string().optional().nullable(),
    duracao_minutos: vine.number().positive().withoutDecimals().optional(),
    preco: vine.number().positive().optional(),
    ativo: vine.boolean().optional(),
  })
)
