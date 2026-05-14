import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    await this.db.knexRawQuery(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'agendamento_status') THEN
          CREATE TYPE agendamento_status AS ENUM ('PENDENTE', 'CONFIRMADO', 'CANCELADO');
        END IF;
      END $$;
    `)

    this.schema.createTable('agendamentos', (table) => {
      table.uuid('id').primary()
      table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
      table.uuid('servico_id').notNullable().references('id').inTable('servicos').onDelete('RESTRICT')

      table.string('cliente_nome', 150).notNullable()
      table.string('cliente_whatsapp', 20).notNullable()
      table.string('cliente_email', 150).nullable()

      table.timestamp('data_hora_inicio', { useTz: true }).notNullable()
      table.timestamp('data_hora_fim', { useTz: true }).notNullable()

      table.specificType('status', 'agendamento_status').notNullable().defaultTo('PENDENTE')
      table.string('status_confirmacao', 40).nullable()
      table.text('notas_internas').nullable()

      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).nullable()

      table.index(['user_id', 'data_hora_inicio'], 'agendamentos_user_inicio_idx')
      table.index(['user_id', 'status'], 'agendamentos_user_status_idx')
    })

    this.schema.createTable('booking_attempts', (table) => {
      table.uuid('id').primary()
      table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
      table.uuid('servico_id').nullable().references('id').inTable('servicos').onDelete('SET NULL')
      table.timestamp('slot_datetime', { useTz: true }).notNullable()
      table.string('resultado', 32).notNullable()
      table.text('detalhes').nullable()
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
    })

    this.schema.createTable('agendamento_cancelamentos', (table) => {
      table.uuid('id').primary()
      table
        .uuid('agendamento_id')
        .notNullable()
        .references('id')
        .inTable('agendamentos')
        .onDelete('CASCADE')
      table.text('motivo').nullable()
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable('agendamento_cancelamentos')
    this.schema.dropTable('booking_attempts')
    this.schema.dropTable('agendamentos')

    this.defer(async (db) => {
      await db.knexRawQuery(`DROP TYPE IF EXISTS agendamento_status;`)
    })
  }
}
