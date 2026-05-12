import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.createTable('configuracoes', (table) => {
      table.uuid('id').primary()
      table
        .uuid('user_id')
        .notNullable()
        .unique()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')

      table.string('logo_url', 500).nullable()
      table.string('nome_exibicao', 150).nullable()
      table.string('tagline', 255).nullable()
      table.string('nome_profissional', 150).nullable()
      table.string('especialidade', 100).nullable()
      table.string('hero_titulo', 255).nullable()
      table.string('hero_titulo_destaque', 255).nullable()
      table.text('hero_subtitulo').nullable()
      table.string('banner_titulo', 255).nullable()
      table.string('banner_subtitulo', 255).nullable()
      table.string('endereco', 255).nullable()
      table.string('instagram', 100).nullable()
      table.string('whatsapp', 20).nullable()
      table.string('cor_principal', 7).notNullable().defaultTo('#D4788A')
      table.string('cor_secundaria', 7).notNullable().defaultTo('#F2C4CE')
      table.boolean('primeira_visita').notNullable().defaultTo(true)

      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).nullable()
    })
  }

  async down() {
    this.schema.dropTable('configuracoes')
  }
}
