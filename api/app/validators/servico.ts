import vine from '@vinejs/vine'
import { vineUuidLike } from '#validators/common'

const incrementoSchema = vine.object({
  id: vineUuidLike().optional(),
  nome: vine.string().trim().minLength(1).maxLength(150),
  duracao_minutos: vine.number().positive().withoutDecimals(),
  preco: vine.number().min(0),
  obrigatorio: vine.boolean(),
  ordem: vine.number().withoutDecimals().optional(),
})

export const createServicoValidator = vine.compile(
  vine.object({
    nome: vine.string().minLength(1).maxLength(150),
    emoji: vine.string().minLength(1).maxLength(10),
    descricao: vine.string().optional().nullable(),
    duracao_minutos: vine.number().positive().withoutDecimals(),
    preco: vine.number().positive(),
    ativo: vine.boolean().optional(),
    incrementos: vine.array(incrementoSchema).optional(),
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
    incrementos: vine.array(incrementoSchema).optional(),
  })
)
