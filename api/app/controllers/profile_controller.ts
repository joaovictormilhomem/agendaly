import Configuracao from '#models/configuracao'
import User from '#models/user'
import { validarImagemUpload } from '#helpers/imagem_upload'
import { serializePerfil, defaultPerfil } from '#transformers/perfil_transformer'
import { updatePerfilValidator } from '#validators/perfil'
import { UUID_LIKE_PATTERN } from '#validators/common'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import crypto from 'node:crypto'
import { readFile } from 'node:fs/promises'

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
    const file = request.file('imagem')
    const upload = file ? validarImagemUpload(file) : null
    if (upload && 'error' in upload) return response.unprocessableEntity({ message: upload.error })
    const image = upload ? { contentType: upload.contentType, bytes: await readFile(upload.path) } : null

    const config = await db.transaction(async (trx) => {
      await trx.from('users').where('id', user.id).forUpdate().first()
      const config = await Configuracao.firstOrCreate(
        { userId: user.id },
        { id: crypto.randomUUID(), userId: user.id },
        { client: trx }
      )

      let logoUrl = config.logoUrl
      if (image) {
        const id = crypto.randomUUID()
        await trx.table('perfil_logos')
          .insert({ id, user_id: user.id, content_type: image.contentType, arquivo: image.bytes })
          .onConflict('user_id')
          .merge()
        logoUrl = `/api/public/perfil-logo/${id}`
      } else if (body.remover_logo || body.logo_url) {
        await trx.from('perfil_logos').where('user_id', user.id).delete()
        logoUrl = body.remover_logo ? null : body.logo_url ?? config.logoUrl
      }

      config.merge({
        logoUrl,
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

      await config.useTransaction(trx).save()
      return config
    })

    return response.ok(serializePerfil(config, user.slug))
  }

  async logo({ params, response }: HttpContext) {
    if (!UUID_LIKE_PATTERN.test(params.id)) return response.notFound()
    const image = await db.from('perfil_logos').where('id', params.id).first()
    if (!image) return response.notFound()

    response.header('Content-Type', image.content_type)
    response.header('Cache-Control', 'public, max-age=3600')
    response.header('X-Content-Type-Options', 'nosniff')
    return response.send(image.arquivo)
  }

  async publicShow({ params, response }: HttpContext) {
    const user = await (User as any).query().where('slug', params.slug).first() as User | null
    if (!user) return response.notFound({ message: 'Profissional não encontrada' })

    const config = await Configuracao.findBy('user_id', user.id)
    if (!config) return response.ok(defaultPerfil(user.slug))

    return response.ok(serializePerfil(config, user.slug))
  }
}
