import Servico from '#models/servico'
import ServicoIncremento from '#models/servico_incremento'
import ServicoIncrementoAdicional from '#models/servico_incremento_adicional'
import User from '#models/user'
import {
  duracaoAPartirDe,
  duracaoIncrementoValida,
  precoAPartirDe,
  serializeIncremento,
} from '#helpers/servico_incrementos'
import { invalidateSlotCacheForUser } from '#services/slot_engine_service'
import { createServicoValidator, updateServicoValidator } from '#validators/servico'
import type { HttpContext } from '@adonisjs/core/http'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import db from '@adonisjs/lucid/services/db'
import crypto from 'node:crypto'

type IncrementoInput = {
  id?: string
  nome: string
  duracao_minutos: number
  preco: number
  obrigatorio: boolean
  ordem?: number
  adicionais?: { id?: string; nome: string; duracao_minutos: number; preco: number; ordem?: number }[]
}

function serializeServico(s: Servico) {
  const incrementos = [...(s.incrementos ?? [])].sort(
    (a, b) => a.ordem - b.ordem || a.nome.localeCompare(b.nome)
  )
  const temIncrementos = incrementos.length > 0
  return {
    id: s.id,
    nome: s.nome,
    emoji: s.emoji,
    descricao: s.descricao ?? '',
    duracao_minutos: temIncrementos ? duracaoAPartirDe(s, incrementos) : s.duracaoMinutos,
    preco: temIncrementos ? precoAPartirDe(s, incrementos) : Number(s.preco),
    preco_base: Number(s.preco),
    duracao_base_minutos: s.duracaoMinutos,
    ativo: s.ativo,
    tem_incrementos: temIncrementos,
    incrementos: incrementos.map(serializeIncremento),
  }
}

function duracaoValida(duracao: number) {
  return duracao >= 15 && duracao % 15 === 0
}

function validarIncrementosPayload(incrementos: IncrementoInput[] | undefined) {
  if (!incrementos) return null
  for (const inc of incrementos) {
    if (!duracaoIncrementoValida(inc.duracao_minutos)) {
      return 'Cada especificação deve ter duração de no mínimo 15 minutos e avançar de 15 em 15'
    }
    if (inc.preco < 0) {
      return 'O preço da especificação não pode ser negativo'
    }
    for (const adicional of inc.adicionais ?? []) {
      if (!duracaoIncrementoValida(adicional.duracao_minutos)) {
        return 'Cada adicional deve ter duraÃ§Ã£o de no mÃ­nimo 15 minutos e avanÃ§ar de 15 em 15'
      }
      if (adicional.preco < 0) return 'O preÃ§o do adicional nÃ£o pode ser negativo'
    }
  }
  return null
}

async function syncAdicionais(
  incremento: ServicoIncremento,
  adicionais: IncrementoInput['adicionais'],
  trx?: TransactionClientContract
) {
  const q = ServicoIncrementoAdicional.query()
  if (trx) q.useTransaction(trx)
  const existentes = await q.where('servico_incremento_id', incremento.id)
  const keepIds = new Set((adicionais ?? []).map((a) => a.id).filter(Boolean) as string[])
  for (const existente of existentes) {
    if (!keepIds.has(existente.id)) {
      if (trx) existente.useTransaction(trx)
      await existente.delete()
    }
  }
  for (const [ordem, item] of (adicionais ?? []).entries()) {
    const data = { nome: item.nome.trim(), duracaoMinutos: item.duracao_minutos, preco: item.preco, ordem: item.ordem ?? ordem }
    const existente = item.id ? existentes.find((a) => a.id === item.id) : undefined
    if (existente) {
      if (trx) existente.useTransaction(trx)
      existente.merge(data)
      await existente.save()
    } else {
      await ServicoIncrementoAdicional.create({ id: crypto.randomUUID(), servicoIncrementoId: incremento.id, ...data }, trx ? { client: trx } : undefined)
    }
  }
}

async function syncIncrementos(
  servico: Servico,
  incrementos: IncrementoInput[] | undefined,
  trx?: TransactionClientContract
) {
  if (incrementos === undefined) return

  const q = ServicoIncremento.query()
  if (trx) q.useTransaction(trx)
  const existentes = await q.where('servico_id', servico.id)
  const keepIds = new Set(incrementos.map((i) => i.id).filter(Boolean) as string[])

  for (const ex of existentes) {
    if (!keepIds.has(ex.id)) {
      if (trx) ex.useTransaction(trx)
      await ex.delete()
    }
  }

  let ordem = 0
  for (const item of incrementos) {
    const data = {
      nome: item.nome.trim(),
      duracaoMinutos: item.duracao_minutos,
      preco: item.preco,
      obrigatorio: item.obrigatorio,
      ordem: item.ordem ?? ordem,
    }
    ordem += 1

    if (item.id) {
      const found = existentes.find((e) => e.id === item.id)
      if (found) {
        if (trx) found.useTransaction(trx)
        found.merge(data)
        await found.save()
        await syncAdicionais(found, item.adicionais, trx)
        continue
      }
    }

    const created = await ServicoIncremento.create(
      {
        id: crypto.randomUUID(),
        servicoId: servico.id,
        ...data,
      },
      trx ? { client: trx } : undefined
    )
    await syncAdicionais(created, item.adicionais, trx)
  }
}

async function findUserAndAuthorize(
  slug: string,
  authJwt: HttpContext['authJwt'],
  response: HttpContext['response']
) {
  const user = (await User.query().where('slug', slug).first()) as User | null
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
      .preload('incrementos', (q) => q.preload('adicionais'))
      .orderBy('created_at', 'asc')

    return response.ok(servicos.map(serializeServico))
  }

  async store({ params, request, authJwt, response }: HttpContext) {
    const user = await findUserAndAuthorize(params.slug, authJwt, response)
    if (!user) return

    const body = await request.validateUsing(createServicoValidator)
    if (!duracaoValida(body.duracao_minutos)) {
      return response.unprocessableEntity({
        message: 'A duração deve ser de no mínimo 15 minutos e avançar de 15 em 15 minutos',
      })
    }
    const errInc = validarIncrementosPayload(body.incrementos)
    if (errInc) return response.unprocessableEntity({ message: errInc })

    const servico = await db.transaction(async (trx) => {
      const created = await Servico.create(
        {
          id: crypto.randomUUID(),
          userId: user.id,
          nome: body.nome,
          emoji: body.emoji,
          descricao: body.descricao ?? null,
          duracaoMinutos: body.duracao_minutos,
          preco: body.preco,
          ativo: body.ativo ?? true,
        },
        { client: trx }
      )
      created.useTransaction(trx)
      await syncIncrementos(created, body.incrementos, trx)
      await created.load('incrementos', (q) => q.preload('adicionais'))
      return created
    })

    invalidateSlotCacheForUser(user.id)

    return response.created(serializeServico(servico))
  }

  async update({ params, request, authJwt, response }: HttpContext) {
    const user = await findUserAndAuthorize(params.slug, authJwt, response)
    if (!user) return

    const servico = await Servico.query().where('id', params.id).where('user_id', user.id).first()

    if (!servico) return response.notFound({ message: 'Serviço não encontrado' })

    const body = await request.validateUsing(updateServicoValidator)
    if (body.duracao_minutos !== undefined && !duracaoValida(body.duracao_minutos)) {
      return response.unprocessableEntity({
        message: 'A duração deve ser de no mínimo 15 minutos e avançar de 15 em 15 minutos',
      })
    }
    const errInc = validarIncrementosPayload(body.incrementos)
    if (errInc) return response.unprocessableEntity({ message: errInc })

    await db.transaction(async (trx) => {
      servico.useTransaction(trx)
      servico.merge({
        nome: body.nome ?? servico.nome,
        emoji: body.emoji ?? servico.emoji,
        descricao: body.descricao !== undefined ? (body.descricao ?? null) : servico.descricao,
        duracaoMinutos: body.duracao_minutos ?? servico.duracaoMinutos,
        preco: body.preco ?? servico.preco,
        ativo: body.ativo !== undefined ? body.ativo : servico.ativo,
      })
      await servico.save()
      await syncIncrementos(servico, body.incrementos, trx)
    })

    await servico.load('incrementos', (q) => q.preload('adicionais'))
    invalidateSlotCacheForUser(user.id)

    return response.ok(serializeServico(servico))
  }

  async destroy({ params, authJwt, response }: HttpContext) {
    const user = await findUserAndAuthorize(params.slug, authJwt, response)
    if (!user) return

    const servico = await Servico.query().where('id', params.id).where('user_id', user.id).first()

    if (!servico) return response.notFound({ message: 'Serviço não encontrado' })

    await servico.delete()

    invalidateSlotCacheForUser(user.id)

    return response.noContent()
  }

  async publicIndex({ params, response }: HttpContext) {
    const user = (await User.query().where('slug', params.slug).first()) as User | null
    if (!user) return response.notFound({ message: 'Profissional não encontrada' })

    const servicos = await Servico.query()
      .where('user_id', user.id)
      .where('ativo', true)
      .preload('incrementos', (q) => q.preload('adicionais'))
      .orderBy('created_at', 'asc')

    return response.ok(servicos.map(serializeServico))
  }
}
