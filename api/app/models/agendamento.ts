import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import AgendamentoIncremento from '#models/agendamento_incremento'
import Servico from '#models/servico'
import User from '#models/user'

export type AgendamentoStatus = 'PENDENTE' | 'CONFIRMADO' | 'CANCELADO'

export default class Agendamento extends BaseModel {
  static table = 'agendamentos'
  static selfAssignPrimaryKey = true

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare userId: string

  @column()
  declare servicoId: string

  @column()
  declare clienteNome: string

  @column()
  declare clienteWhatsapp: string

  @column()
  declare clienteEmail: string | null

  @column.dateTime()
  declare dataHoraInicio: DateTime

  @column.dateTime()
  declare dataHoraFim: DateTime

  @column()
  declare status: AgendamentoStatus

  @column()
  declare statusConfirmacao: string | null

  @column()
  declare notasInternas: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Servico)
  declare servico: BelongsTo<typeof Servico>

  @hasMany(() => AgendamentoIncremento)
  declare incrementos: HasMany<typeof AgendamentoIncremento>
}
