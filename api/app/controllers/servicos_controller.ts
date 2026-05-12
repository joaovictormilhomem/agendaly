import Servico from '#models/servico'
import User from '#models/user'
import { createServicoValidator, updateServicoValidator } from '#validators/servico'
import type { HttpContext } from '@adonisjs/core/http'
import crypto from 'node:crypto'

function serializeServico(s: Servico) {
  return {
    id: s.id,
    nome: s.nome,
    emoji: s.emoji,
    descricao: s.descricao ?? '',
    duracao_minutos: s.duracaoMinutos,
    preco: Number(s.preco),
    ativo: s.ativo,
  }
}

async function findUserAndAuthorize(slug: string, authJwt: HttpContext['authJwt'], response: HttpContext['response']) {
  const user = await (User as any).query().where('slug', slug).first() as User | null
  if (!user) {
    response.notFound({ message: 'Profissional não encontrada' })
    return null
  }
  if (authJwt!.user.slug !== user.slug && authJwt!.user.role !== 'SUPERADMIN') {
    response.forbidden({ message: 'Acesso negado' })
    return null
  }
  return user
}

export default class ServicosController {
  async index({ params, authJwt, response }: HttpContext) {
    const user = await findUserAndAuthorize(params.slug, authJwt, response)
    if (!user) return

    const servicos = await Servico.query()
      .where('user_id', user.id)
      .orderBy('created_at', 'asc')

    return response.ok(servicos.map(serializeServico))
  }

  async store({ params, request, authJwt, response }: HttpContext) {
    const user = await findUserAndAuthorize(params.slug, authJwt, response)
    if (!user) return

    const body = await request.validateUsing(createServicoValidator)

    const servico = await Servico.create({
      id: crypto.randomUUID(),
      userId: user.id,
      nome: body.nome,
      emoji: body.emoji,
      descricao: body.descricao ?? null,
      duracaoMinutos: body.duracao_minutos,
      preco: body.preco,
      ativo: body.ativo ?? true,
    })

    return response.created(serializeServico(servico))
  }

  async update({ params, request, authJwt, response }: HttpContext) {
    const user = await findUserAndAuthorize(params.slug, authJwt, response)
    if (!user) return

    const servico = await Servico.query()
      .where('id', params.id)
      .where('user_id', user.id)
      .first()

    if (!servico) return response.notFound({ message: 'Serviço não encontrado' })

    const body = await request.validateUsing(updateServicoValidator)

    servico.merge({
      nome: body.nome ?? servico.nome,
      emoji: body.emoji ?? servico.emoji,
      descricao: body.descricao !== undefined ? (body.descricao ?? null) : servico.descricao,
      duracaoMinutos: body.duracao_minutos ?? servico.duracaoMinutos,
      preco: body.preco ?? servico.preco,
      ativo: body.ativo !== undefined ? body.ativo : servico.ativo,
    })

    await servico.save()

    return response.ok(serializeServico(servico))
  }

  async destroy({ params, authJwt, response }: HttpContext) {
    const user = await findUserAndAuthorize(params.slug, authJwt, response)
    if (!user) return

    const servico = await Servico.query()
      .where('id', params.id)
      .where('user_id', user.id)
      .first()

    if (!servico) return response.notFound({ message: 'Serviço não encontrado' })

    await servico.delete()

    return response.noContent()
  }

  async publicIndex({ params, response }: HttpContext) {
    const user = await (User as any).query().where('slug', params.slug).first() as User | null
    if (!user) return response.notFound({ message: 'Profissional não encontrada' })

    const servicos = await Servico.query()
      .where('user_id', user.id)
      .where('ativo', true)
      .orderBy('created_at', 'asc')

    return response.ok(servicos.map(serializeServico))
  }
}
