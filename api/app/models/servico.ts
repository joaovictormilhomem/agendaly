import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import ServicoIncremento from '#models/servico_incremento'
import User from '#models/user'

export default class Servico extends BaseModel {
  static table = 'servicos'
  static selfAssignPrimaryKey = true

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare userId: string

  @column()
  declare nome: string

  @column()
  declare emoji: string

  @column()
  declare descricao: string | null

  @column()
  declare duracaoMinutos: number

  @column()
  declare preco: number

  @column()
  declare ativo: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @hasMany(() => ServicoIncremento)
  declare incrementos: HasMany<typeof ServicoIncremento>
}
