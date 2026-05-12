import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import Configuracao from '#models/configuracao'
import hash from '@adonisjs/core/services/hash'
import crypto from 'node:crypto'

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

    await Configuracao.firstOrCreate(
      { userId: profDemo.id },
      {
        id: crypto.randomUUID(),
        userId: profDemo.id,
        logoUrl: null,
        nomeExibicao: 'Nailê Studio',
        tagline: 'Nail Designer Profissional',
        nomeProfissional: 'Nailê Sousa',
        especialidade: 'Nail Designer',
        heroTitulo: 'Unhas que contam',
        heroTituloDestaque: 'a sua história',
        heroSubtitulo:
          'Especialista em alongamentos, nail art e esmaltação em gel. Atendimento personalizado em Palmas - TO.',
        bannerTitulo: 'Pronta para unhas incríveis?',
        bannerSubtitulo: 'Agende online agora mesmo — disponível 24 horas',
        endereco: 'Palmas - TO',
        instagram: '@naile_studio',
        whatsapp: '(63) 99999-9999',
        corPrincipal: '#D4788A',
        corSecundaria: '#F2C4CE',
        primeiraVisita: false,
      }
    )
  }
}
