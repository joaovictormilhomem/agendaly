import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import Agendamento from '#models/agendamento'
import ServicoIncremento from '#models/servico_incremento'

export default class AgendamentoIncremento extends BaseModel {
  static table = 'agendamento_incrementos'
  static selfAssignPrimaryKey = true

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare agendamentoId: string

  @column()
  declare servicoIncrementoId: string | null

  @column()
  declare nome: string

  @column()
  declare duracaoMinutos: number

  @column()
  declare preco: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => Agendamento)
  declare agendamento: BelongsTo<typeof Agendamento>

  @belongsTo(() => ServicoIncremento)
  declare servicoIncremento: BelongsTo<typeof ServicoIncremento>
}
