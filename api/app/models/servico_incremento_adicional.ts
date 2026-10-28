import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import ServicoIncremento from '#models/servico_incremento'

export default class ServicoIncrementoAdicional extends BaseModel {
  static table = 'servico_incremento_adicionais'
  static selfAssignPrimaryKey = true

  @column({ isPrimary: true }) declare id: string
  @column() declare servicoIncrementoId: string
  @column() declare nome: string
  @column() declare duracaoMinutos: number
  @column() declare preco: number
  @column() declare ordem: number
  @column.dateTime({ autoCreate: true }) declare createdAt: DateTime
  @column.dateTime({ autoCreate: true, autoUpdate: true }) declare updatedAt: DateTime | null

  @belongsTo(() => ServicoIncremento)
  declare especificacao: BelongsTo<typeof ServicoIncremento>
}
