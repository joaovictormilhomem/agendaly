import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import User from '#models/user'

export default class Configuracao extends BaseModel {
  static table = 'configuracoes'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare userId: string

  @column()
  declare logoUrl: string | null

  @column()
  declare nomeExibicao: string | null

  @column()
  declare tagline: string | null

  @column()
  declare nomeProfissional: string | null

  @column()
  declare especialidade: string | null

  @column()
  declare heroTitulo: string | null

  @column()
  declare heroTituloDestaque: string | null

  @column()
  declare heroSubtitulo: string | null

  @column()
  declare bannerTitulo: string | null

  @column()
  declare bannerSubtitulo: string | null

  @column()
  declare endereco: string | null

  @column()
  declare instagram: string | null

  @column()
  declare whatsapp: string | null

  @column()
  declare corPrincipal: string

  @column()
  declare corSecundaria: string

  @column()
  declare primeiraVisita: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
