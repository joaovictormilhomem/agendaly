import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.createTable('servico_incremento_adicionais', (table) => {
      table.uuid('id').primary()
      table
        .uuid('servico_incremento_id')
        .notNullable()
        .references('id')
        .inTable('servico_incrementos')
        .onDelete('CASCADE')
      table.string('nome', 150).notNullable()
      table.integer('duracao_minutos').notNullable()
      table.decimal('preco', 10, 2).notNullable()
      table.integer('ordem').notNullable().defaultTo(0)
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).nullable()
      table.index(['servico_incremento_id'])
    })

    this.schema.createTable('agendamento_adicionais', (table) => {
      table.uuid('id').primary()
      table
        .uuid('agendamento_incremento_id')
        .notNullable()
        .references('id')
        .inTable('agendamento_incrementos')
        .onDelete('CASCADE')
      table
        .uuid('servico_incremento_adicional_id')
        .nullable()
        .references('id')
        .inTable('servico_incremento_adicionais')
        .onDelete('SET NULL')
      table.string('nome', 150).notNullable()
      table.integer('duracao_minutos').notNullable()
      table.decimal('preco', 10, 2).notNullable()
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.index(['agendamento_incremento_id'])
    })
  }

  async down() {
    this.schema.dropTable('agendamento_adicionais')
    this.schema.dropTable('servico_incremento_adicionais')
  }
}
