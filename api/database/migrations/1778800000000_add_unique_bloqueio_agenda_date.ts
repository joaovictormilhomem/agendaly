import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    // Bancos existentes podem conter repeticoes criadas pelo fluxo anterior.
    // Mantemos o registro mais antigo de cada profissional/data antes da constraint.
    await this.db.rawQuery(`
      DELETE FROM bloqueios_agenda
      WHERE id IN (
        SELECT id
        FROM (
          SELECT id,
            ROW_NUMBER() OVER (
              PARTITION BY user_id, data
              ORDER BY created_at ASC, id ASC
            ) AS occurrence
          FROM bloqueios_agenda
        ) duplicated
        WHERE occurrence > 1
      )
    `)

    this.schema.alterTable('bloqueios_agenda', (table) => {
      table.unique(['user_id', 'data'], {
        indexName: 'bloqueios_agenda_user_id_data_unique',
      })
    })
  }

  async down() {
    this.schema.alterTable('bloqueios_agenda', (table) => {
      table.dropUnique(['user_id', 'data'], 'bloqueios_agenda_user_id_data_unique')
    })
  }
}
