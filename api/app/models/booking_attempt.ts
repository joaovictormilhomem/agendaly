import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import Servico from '#models/servico'
import User from '#models/user'

export default class BookingAttempt extends BaseModel {
  static table = 'booking_attempts'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare userId: string

  @column()
  declare servicoId: string | null

  @column.dateTime({ columnName: 'slot_datetime' })
  declare slotDatetime: DateTime

  @column()
  declare resultado: string

  @column()
  declare detalhes: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Servico)
  declare servico: BelongsTo<typeof Servico>
}
