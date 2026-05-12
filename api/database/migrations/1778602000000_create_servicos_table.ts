import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.createTable('servicos', (table) => {
      table.uuid('id').primary()
      table
        .uuid('user_id')
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')

      table.string('nome', 150).notNullable()
      table.string('emoji', 10).notNullable()
      table.text('descricao').nullable()
      table.integer('duracao_minutos').notNullable()
      table.decimal('preco', 10, 2).notNullable()
      table.boolean('ativo').notNullable().defaultTo(true)

      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).nullable()
    })
  }

  async down() {
    this.schema.dropTable('servicos')
  }
}
