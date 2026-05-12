import Configuracao from '#models/configuracao'
import User from '#models/user'
import { serializePerfil, defaultPerfil } from '#transformers/perfil_transformer'
import { updatePerfilValidator } from '#validators/perfil'
import type { HttpContext } from '@adonisjs/core/http'
import crypto from 'node:crypto'

export default class ProfileController {
  async show({ params, authJwt, response }: HttpContext) {
    const user = await (User as any).query().where('slug', params.slug).first() as User | null
    if (!user) return response.notFound({ message: 'Profissional não encontrada' })

    if (authJwt!.user.slug !== user.slug && authJwt!.user.role !== 'SUPERADMIN') {
      return response.forbidden({ message: 'Acesso negado' })
    }

    const config = await Configuracao.firstOrCreate(
      { userId: user.id },
      { id: crypto.randomUUID(), userId: user.id }
    )

    return response.ok(serializePerfil(config, user.slug))
  }

  async update({ params, request, authJwt, response }: HttpContext) {
    const user = await (User as any).query().where('slug', params.slug).first() as User | null
    if (!user) return response.notFound({ message: 'Profissional não encontrada' })

    if (authJwt!.user.slug !== user.slug && authJwt!.user.role !== 'SUPERADMIN') {
      return response.forbidden({ message: 'Acesso negado' })
    }

    const body = await request.validateUsing(updatePerfilValidator)

    const config = await Configuracao.firstOrCreate(
      { userId: user.id },
      { id: crypto.randomUUID(), userId: user.id }
    )

    config.merge({
      logoUrl: body.logo_url ?? config.logoUrl,
      nomeExibicao: body.nome_exibicao ?? config.nomeExibicao,
      tagline: body.tagline ?? config.tagline,
      nomeProfissional: body.nome_profissional ?? config.nomeProfissional,
      especialidade: body.especialidade ?? config.especialidade,
      heroTitulo: body.hero_titulo ?? config.heroTitulo,
      heroTituloDestaque: body.hero_titulo_destaque ?? config.heroTituloDestaque,
      heroSubtitulo: body.hero_subtitulo ?? config.heroSubtitulo,
      bannerTitulo: body.banner_titulo ?? config.bannerTitulo,
      bannerSubtitulo: body.banner_subtitulo ?? config.bannerSubtitulo,
      endereco: body.endereco ?? config.endereco,
      instagram: body.instagram ?? config.instagram,
      whatsapp: body.whatsapp ?? config.whatsapp,
      corPrincipal: body.cor_principal ?? config.corPrincipal,
      corSecundaria: body.cor_secundaria ?? config.corSecundaria,
      primeiraVisita: false,
    })

    await config.save()

    return response.ok(serializePerfil(config, user.slug))
  }

  async publicShow({ params, response }: HttpContext) {
    const user = await (User as any).query().where('slug', params.slug).first() as User | null
    if (!user) return response.notFound({ message: 'Profissional não encontrada' })

    const config = await Configuracao.findBy('user_id', user.id)
    if (!config) return response.ok(defaultPerfil(user.slug))

    return response.ok(serializePerfil(config, user.slug))
  }
}
