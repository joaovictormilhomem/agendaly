import vine from '@vinejs/vine'

const intervaloSchema = vine.object({
  hora_inicio: vine.string().regex(/^\d{2}:\d{2}$/),
  hora_fim: vine.string().regex(/^\d{2}:\d{2}$/),
})

const diaSchema = vine.object({
  dia: vine.number().min(0).max(6).withoutDecimals(),
  ativo: vine.boolean(),
  intervalos: vine.array(intervaloSchema),
})

export const updateDisponibilidadeValidator = vine.compile(
  vine.object({
    intervalo_atendimento_minutos: vine.number().min(0).withoutDecimals(),
    dias: vine.array(diaSchema).fixedLength(7),
    bloqueios: vine.array(
      vine.object({
        id: vine.string().optional(),
        data: vine.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        motivo: vine.string().minLength(1).maxLength(255),
      })
    ),
  })
)
