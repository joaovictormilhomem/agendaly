import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import Agendamento from '#models/agendamento'
import User from '#models/user'

export type WhatsappMensagemContexto = 'agendamento_criado' | 'confirmado_admin' | 'cancelado'
export type WhatsappMensagemStatus = 'pendente' | 'enviado' | 'falhou'

export default class WhatsappMensagem extends BaseModel {
  static table = 'whatsapp_mensagens'
  static selfAssignPrimaryKey = true

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare userId: string

  @column()
  declare agendamentoId: string

  @column()
  declare contexto: WhatsappMensagemContexto

  @column()
  declare destinatario: string

  @column()
  declare corpo: string

  @column()
  declare status: WhatsappMensagemStatus

  @column()
  declare erro: string | null

  @column()
  declare chatId: string | null

  @column()
  declare messageId: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Agendamento)
  declare agendamento: BelongsTo<typeof Agendamento>
}
