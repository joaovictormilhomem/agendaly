import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.createTable('disponibilidades', (table) => {
      table.uuid('id').primary()
      table
        .uuid('user_id')
        .notNullable()
        .unique()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')

      table.integer('intervalo_atendimento_minutos').notNullable().defaultTo(30)
      table.jsonb('dias').notNullable()

      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).nullable()
    })

    this.schema.createTable('bloqueios_agenda', (table) => {
      table.uuid('id').primary()
      table
        .uuid('user_id')
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')

      table.date('data').notNullable()
      table.string('motivo', 255).notNullable()

      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable('bloqueios_agenda')
    this.schema.dropTable('disponibilidades')
  }
}
