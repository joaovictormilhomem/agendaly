import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('support_tickets', (table) => {
      table
        .enu('status', ['OPEN', 'IN_PROGRESS', 'WAITING_CUSTOMER', 'RESOLVED'])
        .notNullable()
        .defaultTo('OPEN')
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.uuid('unread_reply_id').nullable()
      table.index(['user_id', 'updated_at'])
      table.index(['status', 'updated_at'])
    })

    this.defer(async (db) => {
      await db.from('support_tickets').update({ updated_at: db.raw('created_at') })
    })

    this.schema.createTable('support_ticket_replies', (table) => {
      table.increments('sequence')
      table.uuid('id').notNullable().unique()
      table.uuid('ticket_id').notNullable().references('id').inTable('support_tickets').onDelete('CASCADE')
      table.enu('author', ['CUSTOMER', 'SUPPORT']).notNullable()
      table.text('body').notNullable()
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.index(['ticket_id', 'sequence'])
    })
  }

  async down() {
    this.schema.dropTable('support_ticket_replies')
    this.schema.alterTable('support_tickets', (table) => {
      table.dropIndex(['user_id', 'updated_at'])
      table.dropIndex(['status', 'updated_at'])
      table.dropColumns('status', 'updated_at', 'unread_reply_id')
    })
  }
}
