import { BaseModel, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

export default class AuthRefreshToken extends BaseModel {
  static table = 'auth_refresh_tokens'
  static selfAssignPrimaryKey = true

  @column({ isPrimary: true })
  declare id: string

  @column({ columnName: 'session_id' })
  declare sessionId: string

  @column({ columnName: 'user_id' })
  declare userId: string

  @column({ columnName: 'token_hash' })
  declare tokenHash: string

  @column.dateTime({ autoCreate: true, columnName: 'created_at' })
  declare createdAt: DateTime

  @column.dateTime({ columnName: 'expires_at' })
  declare expiresAt: DateTime

  @column.dateTime({ columnName: 'revoked_at' })
  declare revokedAt: DateTime | null

  @column({ columnName: 'replaced_by' })
  declare replacedBy: string | null
}

