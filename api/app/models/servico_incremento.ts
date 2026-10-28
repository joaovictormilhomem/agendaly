import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import Servico from '#models/servico'
import ServicoIncrementoAdicional from '#models/servico_incremento_adicional'

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

  @hasMany(() => ServicoIncrementoAdicional)
  declare adicionais: HasMany<typeof ServicoIncrementoAdicional>
}
