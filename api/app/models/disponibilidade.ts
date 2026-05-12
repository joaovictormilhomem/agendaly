import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import User from '#models/user'

export interface Intervalo {
  hora_inicio: string
  hora_fim: string
}

export interface DiaSemana {
  dia: number
  ativo: boolean
  intervalos: Intervalo[]
}

export default class Disponibilidade extends BaseModel {
  static table = 'disponibilidades'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare userId: string

  @column()
  declare intervaloAtendimentoMinutos: number

  @column({
    prepare: (v) => JSON.stringify(v),
    consume: (v) => (typeof v === 'string' ? JSON.parse(v) : v),
  })
  declare dias: DiaSemana[]

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
