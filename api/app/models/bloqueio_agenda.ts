import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import User from '#models/user'

export default class BloqueioAgenda extends BaseModel {
  static table = 'bloqueios_agenda'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare userId: string

  @column({
    consume: (v: Date | string) => {
      if (v instanceof Date) return v.toISOString().slice(0, 10)
      if (typeof v === 'string') return v.slice(0, 10)
      return v
    },
  })
  declare data: string

  @column()
  declare motivo: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
