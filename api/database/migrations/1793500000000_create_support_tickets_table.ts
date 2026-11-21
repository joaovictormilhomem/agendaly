import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.createTable('support_tickets', (table) => {
      table.uuid('id').primary()
      table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
      table.string('subject', 120).notNullable()
      table.text('description').notNullable()
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.index(['created_at', 'id'])
    })
  }

  async down() {
    this.schema.dropTable('support_tickets')
  }
}
