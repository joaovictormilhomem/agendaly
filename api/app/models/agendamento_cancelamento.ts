import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import Agendamento from '#models/agendamento'

export default class AgendamentoCancelamento extends BaseModel {
  static table = 'agendamento_cancelamentos'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare agendamentoId: string

  @column()
  declare motivo: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => Agendamento)
  declare agendamento: BelongsTo<typeof Agendamento>
}
