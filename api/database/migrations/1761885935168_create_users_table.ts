import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    await this.db.knexRawQuery(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
          CREATE TYPE user_role AS ENUM ('SUPERADMIN', 'PROFISSIONAL');
        END IF;
      END $$;
    `)

    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.string('name', 150).notNullable()
      table.string('email', 100).notNullable().unique()
      table.string('password_hash', 255).notNullable()
      table.string('slug', 50).notNullable().unique()
      table.specificType('role', 'user_role').notNullable().defaultTo('PROFISSIONAL')

      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)

    this.defer(async (db) => {
      await db.knexRawQuery(`DROP TYPE IF EXISTS user_role;`)
    })
  }
}
