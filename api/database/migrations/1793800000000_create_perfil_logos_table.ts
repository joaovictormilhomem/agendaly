import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.createTable('perfil_logos', (table) => {
      table.uuid('id').primary()
      table.uuid('user_id').notNullable().unique().references('id').inTable('users').onDelete('CASCADE')
      table.string('content_type', 100).notNullable()
      table.binary('arquivo').notNullable()
    })
  }

  async down() {
    await this.db.from('configuracoes').where('logo_url', 'like', '/api/public/perfil-logo/%').update({ logo_url: null })
    this.schema.dropTable('perfil_logos')
  }
}
