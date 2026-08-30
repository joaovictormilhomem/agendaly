import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.createTable('servico_incrementos', (table) => {
      table.uuid('id').primary()
      table
        .uuid('servico_id')
        .notNullable()
        .references('id')
        .inTable('servicos')
        .onDelete('CASCADE')

      table.string('nome', 150).notNullable()
      table.integer('duracao_minutos').notNullable()
      table.decimal('preco', 10, 2).notNullable()
      table.boolean('obrigatorio').notNullable().defaultTo(false)
      table.integer('ordem').notNullable().defaultTo(0)

      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).nullable()

      table.index(['servico_id'])
    })

    this.schema.createTable('agendamento_incrementos', (table) => {
      table.uuid('id').primary()
      table
        .uuid('agendamento_id')
        .notNullable()
        .references('id')
        .inTable('agendamentos')
        .onDelete('CASCADE')
      table
        .uuid('servico_incremento_id')
        .nullable()
        .references('id')
        .inTable('servico_incrementos')
        .onDelete('SET NULL')

      table.string('nome', 150).notNullable()
      table.integer('duracao_minutos').notNullable()
      table.decimal('preco', 10, 2).notNullable()

      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())

      table.index(['agendamento_id'])
    })
  }

  async down() {
    this.schema.dropTable('agendamento_incrementos')
    this.schema.dropTable('servico_incrementos')
  }
}
