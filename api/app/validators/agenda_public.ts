import vine from '@vinejs/vine'
import { vineUuidLike } from '#validators/common'

export const publicAgendarValidator = vine.compile(
  vine.object({
    cliente_nome: vine.string().trim().minLength(1).maxLength(150),
    cliente_whatsapp: vine.string().trim().minLength(8).maxLength(20),
    cliente_email: vine.string().trim().email().optional(),
    servicoId: vineUuidLike(),
    slot_datetime: vine.string().trim().minLength(10),
  })
)
