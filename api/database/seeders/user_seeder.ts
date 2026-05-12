import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import Servico from '#models/servico'
import hash from '@adonisjs/core/services/hash'
import crypto from 'node:crypto'

const DEMO_SERVICOS = [
  { id: 'a0000000-0000-0000-0000-000000000001', nome: 'Alongamento em Gel', emoji: '💅', descricao: 'Alongamento completo com gel UV, inclui nail art simples.', duracao_minutos: 90, preco: 120, ativo: true },
  { id: 'a0000000-0000-0000-0000-000000000002', nome: 'Manutenção', emoji: '✨', descricao: 'Manutenção do alongamento existente com retoque de gel.', duracao_minutos: 45, preco: 60, ativo: true },
  { id: 'a0000000-0000-0000-0000-000000000003', nome: 'Unhas em Fibra', emoji: '💎', descricao: 'Alongamento em fibra de vidro com acabamento natural e resistente.', duracao_minutos: 90, preco: 100, ativo: true },
  { id: 'a0000000-0000-0000-0000-000000000004', nome: 'Esmaltação Comum', emoji: '🌸', descricao: 'Esmaltação simples com base, esmalte e top coat.', duracao_minutos: 30, preco: 30, ativo: true },
  { id: 'a0000000-0000-0000-0000-000000000005', nome: 'Nail Art', emoji: '🎨', descricao: 'Arte personalizada nas unhas, por unidade ou kit completo.', duracao_minutos: 40, preco: 50, ativo: true },
  { id: 'a0000000-0000-0000-0000-000000000006', nome: 'Remoção', emoji: '🧼', descricao: 'Remoção segura de gel ou acrigel sem danificar a unha natural.', duracao_minutos: 30, preco: 40, ativo: true },
]

export default class extends BaseSeeder {
  async run() {
    await User.firstOrCreate(
      { email: 'superadmin@agendaly.com' },
      {
        id: crypto.randomUUID(),
        name: 'Super Admin',
        email: 'superadmin@agendaly.com',
        passwordHash: await hash.make('admin123456'),
        slug: 'superadmin',
        role: 'SUPERADMIN',
      }
    )

    const profDemo = await User.firstOrCreate(
      { email: 'prof@agendaly.com' },
      {
        id: crypto.randomUUID(),
        name: 'Professional Demo',
        email: 'prof@agendaly.com',
        passwordHash: await hash.make('prof123456'),
        slug: 'prof-demo',
        role: 'PROFISSIONAL',
      }
    )

    for (const s of DEMO_SERVICOS) {
      await Servico.firstOrCreate(
        { id: s.id },
        {
          id: s.id,
          userId: profDemo.id,
          nome: s.nome,
          emoji: s.emoji,
          descricao: s.descricao,
          duracaoMinutos: s.duracao_minutos,
          preco: s.preco,
          ativo: s.ativo,
        }
      )
    }
  }
}
