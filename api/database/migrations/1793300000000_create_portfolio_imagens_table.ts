import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.createTable('portfolio_imagens', (table) => {
      table.uuid('id').primary()
      table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
      table.string('content_type', 100).notNullable()
      table.binary('arquivo').notNullable()
      table.integer('ordem').notNullable().defaultTo(0)
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).nullable()
      table.index(['user_id', 'ordem'])
    })
  }
  async down() { this.schema.dropTable('portfolio_imagens') }
}
