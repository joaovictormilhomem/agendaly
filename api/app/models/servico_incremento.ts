import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import Servico from '#models/servico'

export default class ServicoIncremento extends BaseModel {
  static table = 'servico_incrementos'
  static selfAssignPrimaryKey = true

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare servicoId: string

  @column()
  declare nome: string

  @column()
  declare duracaoMinutos: number

  @column()
  declare preco: number

  @column()
  declare obrigatorio: boolean

  @column()
  declare ordem: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => Servico)
  declare servico: BelongsTo<typeof Servico>
}
