import vine from '@vinejs/vine'
import { vineUuidLike } from '#validators/common'

export const agendaManualValidator = vine.compile(
  vine.object({
    cliente_nome: vine.string().trim().minLength(1).maxLength(150),
    cliente_whatsapp: vine.string().trim().minLength(8).maxLength(20),
    cliente_email: vine.string().trim().email().optional(),
    servicoId: vineUuidLike(),
    data_hora_inicio: vine.string().trim().minLength(10),
    notas_internas: vine.string().trim().minLength(1).maxLength(5000),
  })
)

export const agendaStatusValidator = vine.compile(
  vine.object({
    status: vine.enum(['CONFIRMADO', 'CANCELADO'] as const),
    motivo: vine.string().trim().maxLength(2000).optional(),
  })
)
