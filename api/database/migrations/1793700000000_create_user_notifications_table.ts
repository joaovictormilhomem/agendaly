import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.createTable('user_notifications', (table) => {
      table.uuid('id').primary()
      table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
      table.enu('kind', ['BOOKING_CREATED', 'SUPPORT_STATUS_CHANGED']).notNullable()
      table.uuid('target_id').notNullable()
      table.text('description').notNullable()
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('read_at', { useTz: true }).nullable()
      table.index(['user_id', 'created_at', 'id'])
    })
  }

  async down() {
    this.schema.dropTable('user_notifications')
  }
}
