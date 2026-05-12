import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import User from '#models/user'

export default class Servico extends BaseModel {
  static table = 'servicos'

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
}
