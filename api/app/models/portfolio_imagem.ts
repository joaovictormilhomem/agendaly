import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import User from '#models/user'

export default class PortfolioImagem extends BaseModel {
  static table = 'portfolio_imagens'
  static selfAssignPrimaryKey = true
  @column({ isPrimary: true }) declare id: string
  @column() declare userId: string
  @column() declare contentType: string
  @column() declare arquivo: Buffer
  @column() declare ordem: number
  @column.dateTime({ autoCreate: true }) declare createdAt: DateTime
  @column.dateTime({ autoCreate: true, autoUpdate: true }) declare updatedAt: DateTime | null
  @belongsTo(() => User) declare user: BelongsTo<typeof User>
}
