import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import AgendamentoIncremento from '#models/agendamento_incremento'
import ServicoIncrementoAdicional from '#models/servico_incremento_adicional'

export default class AgendamentoAdicional extends BaseModel {
  static table = 'agendamento_adicionais'
  static selfAssignPrimaryKey = true

  @column({ isPrimary: true }) declare id: string
  @column() declare agendamentoIncrementoId: string
  @column() declare servicoIncrementoAdicionalId: string | null
  @column() declare nome: string
  @column() declare duracaoMinutos: number
  @column() declare preco: number
  @column.dateTime({ autoCreate: true }) declare createdAt: DateTime

  @belongsTo(() => AgendamentoIncremento)
  declare incremento: BelongsTo<typeof AgendamentoIncremento>

  @belongsTo(() => ServicoIncrementoAdicional)
  declare adicionalServico: BelongsTo<typeof ServicoIncrementoAdicional>
}
