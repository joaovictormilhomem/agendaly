import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.createTable('login_throttles', (table) => {
      table.uuid('id').primary()
      table.string('subject', 64).notNullable().unique()
      table.integer('failures').notNullable().defaultTo(0)
      table.timestamp('locked_until', { useTz: true }).nullable()
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).nullable()
    })
  }

  async down() {
    this.schema.dropTable('login_throttles')
  }
}
