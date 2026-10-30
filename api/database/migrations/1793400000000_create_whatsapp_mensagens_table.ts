import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.createTable('whatsapp_mensagens', (table) => {
      table.uuid('id').primary()
      table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
      table
        .uuid('agendamento_id')
        .notNullable()
        .references('id')
        .inTable('agendamentos')
        .onDelete('CASCADE')

      table.string('contexto', 40).notNullable()
      table.string('destinatario', 20).notNullable()
      table.text('corpo').notNullable()
      table.string('status', 20).notNullable()
      table.text('erro').nullable()
      table.string('chat_id', 255).nullable()
      table.string('message_id', 255).nullable()

      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).nullable()

      table.index(['user_id', 'created_at'], 'whatsapp_mensagens_user_created_idx')
    })
  }

  async down() {
    this.schema.dropTable('whatsapp_mensagens')
  }
}
