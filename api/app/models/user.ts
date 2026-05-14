import { BaseModel, column, hasOne, hasMany } from '@adonisjs/lucid/orm'
import type { HasOne } from '@adonisjs/lucid/types/relations'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import Agendamento from '#models/agendamento'
import Configuracao from '#models/configuracao'
import Servico from '#models/servico'
import Disponibilidade from '#models/disponibilidade'
import BloqueioAgenda from '#models/bloqueio_agenda'

export type UserRole = 'SUPERADMIN' | 'PROFISSIONAL'

export default class User extends BaseModel {
  static table = 'users'
  static selfAssignPrimaryKey = true

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

  @column()
  declare email: string

  @column({ columnName: 'password_hash', serializeAs: null })
  declare passwordHash: string

  @column()
  declare slug: string

  @column()
  declare role: UserRole

  @column.dateTime({ autoCreate: true, columnName: 'created_at' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updated_at' })
  declare updatedAt: DateTime | null

  @hasOne(() => Configuracao)
  declare configuracao: HasOne<typeof Configuracao>

  @hasMany(() => Servico)
  declare servicos: HasMany<typeof Servico>

  @hasOne(() => Disponibilidade)
  declare disponibilidade: HasOne<typeof Disponibilidade>

  @hasMany(() => BloqueioAgenda)
  declare bloqueios: HasMany<typeof BloqueioAgenda>

  @hasMany(() => Agendamento)
  declare agendamentos: HasMany<typeof Agendamento>

  get initials() {
    const [first, last] = this.name ? this.name.split(' ') : this.email.split('@')
    if (first && last) {
      return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase()
    }
    return `${first.slice(0, 2)}`.toUpperCase()
  }
}
