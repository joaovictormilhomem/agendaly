import { DEFAULT_DIAS } from '#constants/disponibilidade_defaults'
import BloqueioAgenda from '#models/bloqueio_agenda'
import Disponibilidade from '#models/disponibilidade'
import User from '#models/user'
import { invalidateSlotCacheForUser } from '#services/slot_engine_service'
import { updateDisponibilidadeValidator } from '#validators/disponibilidade'
import type { HttpContext } from '@adonisjs/core/http'
import crypto from 'node:crypto'

async function findUserAndAuthorize(
  slug: string,
  authJwt: HttpContext['authJwt'],
  response: HttpContext['response']
) {
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

export default class DisponibilidadeController {
  async show({ params, authJwt, response }: HttpContext) {
    const user = await findUserAndAuthorize(params.slug, authJwt, response)
    if (!user) return

    const disp = await Disponibilidade.firstOrCreate(
      { userId: user.id },
      { id: crypto.randomUUID(), userId: user.id, intervaloAtendimentoMinutos: 30, dias: DEFAULT_DIAS }
    )

    const bloqueios = await BloqueioAgenda.query()
      .where('user_id', user.id)
      .orderBy('data', 'asc')

    return response.ok(serialize(disp, bloqueios))
  }

  async update({ params, request, authJwt, response }: HttpContext) {
    const user = await findUserAndAuthorize(params.slug, authJwt, response)
    if (!user) return

    const body = await request.validateUsing(updateDisponibilidadeValidator)

    const disp = await Disponibilidade.firstOrCreate(
      { userId: user.id },
      { id: crypto.randomUUID(), userId: user.id, intervaloAtendimentoMinutos: 30, dias: DEFAULT_DIAS }
    )

    disp.intervaloAtendimentoMinutos = body.intervalo_atendimento_minutos
    disp.dias = body.dias
    await disp.save()

    // Replace bloqueios: delete all, insert the new set with server-side UUIDs
    await BloqueioAgenda.query().where('user_id', user.id).delete()

    const bloqueios = await Promise.all(
      body.bloqueios.map((b) =>
        BloqueioAgenda.create({
          id: crypto.randomUUID(),
          userId: user.id,
          data: b.data,
          motivo: b.motivo,
        })
      )
    )

    bloqueios.sort((a, b) => a.data.localeCompare(b.data))

    invalidateSlotCacheForUser(user.id)

    return response.ok(serialize(disp, bloqueios))
  }
}
