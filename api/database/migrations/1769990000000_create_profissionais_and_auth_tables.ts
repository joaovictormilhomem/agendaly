import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    /**
     * Session table used to enforce logout/token invalidation and
     * 30 min inactivity timeout (even for stateless JWT).
     */
    this.schema.createTable('auth_sessions', (table) => {
      table.uuid('id').primary()
      table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('last_activity_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('revoked_at', { useTz: true }).nullable()
    })

    /**
     * Refresh token rotation table. We never store the refresh token in plaintext.
     */
    this.schema.createTable('auth_refresh_tokens', (table) => {
      table.uuid('id').primary()
      table.uuid('session_id').notNullable().references('id').inTable('auth_sessions').onDelete('CASCADE')
      table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')

      table.string('token_hash', 128).notNullable().unique()
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('expires_at', { useTz: true }).notNullable()
      table.timestamp('revoked_at', { useTz: true }).nullable()
      table.uuid('replaced_by').nullable().references('id').inTable('auth_refresh_tokens').onDelete('SET NULL')
    })
  }

  async down() {
    this.schema.dropTable('auth_refresh_tokens')
    this.schema.dropTable('auth_sessions')
  }
}

