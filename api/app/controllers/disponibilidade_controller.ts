import { DEFAULT_DIAS } from '#constants/disponibilidade_defaults'
import BloqueioAgenda from '#models/bloqueio_agenda'
import Disponibilidade from '#models/disponibilidade'
import User from '#models/user'
import { invalidateSlotCacheForUser } from '#services/slot_engine_service'
import { updateDisponibilidadeValidator } from '#validators/disponibilidade'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import crypto from 'node:crypto'

async function findUserAndAuthorize(
  slug: string,
  authJwt: HttpContext['authJwt'],
  response: HttpContext['response']
) {
  const user = (await (User as any).query().where('slug', slug).first()) as User | null
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

function serialize(disp: Disponibilidade, bloqueios: BloqueioAgenda[]) {
  return {
    intervalo_atendimento_minutos: disp.intervaloAtendimentoMinutos,
    dias: disp.dias,
    bloqueios: bloqueios.map((b) => ({
      id: b.id,
      data: b.data,
      motivo: b.motivo,
    })),
  }
}

function horarioEmMinutos(horario: string) {
  const [hora, minuto] = horario.split(':').map(Number)
  if (hora > 23 || minuto > 59) return null
  return hora * 60 + minuto
}

function erroConfiguracaoDias(
  dias: Array<{
    dia: number
    ativo: boolean
    intervalos: Array<{ hora_inicio: string; hora_fim: string }>
  }>
) {
  if (new Set(dias.map((dia) => dia.dia)).size !== 7) {
    return 'Os sete dias da semana devem ser informados sem repetição'
  }

  for (const dia of dias) {
    if (dia.ativo && dia.intervalos.length === 0) {
      return `O dia ${dia.dia} está ativo, mas não possui horário de atendimento`
    }

    const intervalos = dia.intervalos
      .map((intervalo) => ({
        inicio: horarioEmMinutos(intervalo.hora_inicio),
        fim: horarioEmMinutos(intervalo.hora_fim),
      }))
      .sort((a, b) => (a.inicio ?? -1) - (b.inicio ?? -1))

    for (let indice = 0; indice < intervalos.length; indice++) {
      const intervalo = intervalos[indice]
      if (
        intervalo.inicio === null ||
        intervalo.fim === null ||
        intervalo.inicio >= intervalo.fim
      ) {
        return `O dia ${dia.dia} possui um intervalo de horário inválido`
      }
      if (indice > 0 && intervalos[indice - 1].fim! > intervalo.inicio) {
        return `O dia ${dia.dia} possui intervalos de horário sobrepostos`
      }
    }
  }

  return null
}

export default class DisponibilidadeController {
  async show({ params, authJwt, response }: HttpContext) {
    const user = await findUserAndAuthorize(params.slug, authJwt, response)
    if (!user) return

    const disp = await Disponibilidade.firstOrCreate(
      { userId: user.id },
      {
        id: crypto.randomUUID(),
        userId: user.id,
        intervaloAtendimentoMinutos: 30,
        dias: DEFAULT_DIAS,
      }
    )

    const bloqueios = await BloqueioAgenda.query().where('user_id', user.id).orderBy('data', 'asc')

    return response.ok(serialize(disp, bloqueios))
  }

  async update({ params, request, authJwt, response }: HttpContext) {
    const user = await findUserAndAuthorize(params.slug, authJwt, response)
    if (!user) return

    const body = await request.validateUsing(updateDisponibilidadeValidator)

    if (
      body.intervalo_atendimento_minutos !== 0 &&
      (body.intervalo_atendimento_minutos < 15 || body.intervalo_atendimento_minutos % 15 !== 0)
    ) {
      return response.unprocessableEntity({
        message: 'O intervalo deve ser zero ou avançar de 15 em 15 minutos',
      })
    }

    const erroDias = erroConfiguracaoDias(body.dias)
    if (erroDias) return response.unprocessableEntity({ message: erroDias })

    const datasBloqueadas = body.bloqueios.map((bloqueio) => bloqueio.data)
    if (new Set(datasBloqueadas).size !== datasBloqueadas.length) {
      return response.unprocessableEntity({ message: 'Cada data pode possuir apenas um bloqueio' })
    }

    const { disp, bloqueios } = await db.transaction(async (trx) => {
      const existente = await Disponibilidade.query({ client: trx })
        .where('user_id', user.id)
        .first()
      const registro = existente ?? new Disponibilidade()
      registro.useTransaction(trx)
      registro.merge({
        id: existente?.id ?? crypto.randomUUID(),
        userId: user.id,
        intervaloAtendimentoMinutos: body.intervalo_atendimento_minutos,
        dias: body.dias,
      })
      await registro.save()

      // A disponibilidade e seus bloqueios formam uma unica alteracao atomica.
      await BloqueioAgenda.query({ client: trx }).where('user_id', user.id).delete()

      const novosBloqueios: BloqueioAgenda[] = []
      for (const bloqueio of body.bloqueios) {
        const novo = new BloqueioAgenda()
        novo.useTransaction(trx)
        novo.merge({
          id: crypto.randomUUID(),
          userId: user.id,
          data: bloqueio.data,
          motivo: bloqueio.motivo,
        })
        await novo.save()
        novosBloqueios.push(novo)
      }

      return { disp: registro, bloqueios: novosBloqueios }
    })

    bloqueios.sort((a, b) => a.data.localeCompare(b.data))

    invalidateSlotCacheForUser(user.id)

    return response.ok(serialize(disp, bloqueios))
  }
}
