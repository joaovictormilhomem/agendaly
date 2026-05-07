import { BaseModel, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

export default class AuthSession extends BaseModel {
  static table = 'auth_sessions'
  static selfAssignPrimaryKey = true

  @column({ isPrimary: true })
  declare id: string

  @column({ columnName: 'user_id' })
  declare userId: string

  @column.dateTime({ autoCreate: true, columnName: 'created_at' })
  declare createdAt: DateTime

  @column.dateTime({ columnName: 'last_activity_at' })
  declare lastActivityAt: DateTime

  @column.dateTime({ columnName: 'revoked_at' })
  declare revokedAt: DateTime | null
}

