import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import vine from '@vinejs/vine'
import { randomUUID } from 'node:crypto'
import { vineUuidLike } from '#validators/common'
import { createUserNotification } from '#services/user_notifications_service'

const statuses = ['OPEN', 'IN_PROGRESS', 'WAITING_CUSTOMER', 'RESOLVED'] as const
const statusLabels: Record<(typeof statuses)[number], string> = {
  OPEN: 'Aberto',
  IN_PROGRESS: 'Em atendimento',
  WAITING_CUSTOMER: 'Aguardando cliente',
  RESOLVED: 'Resolvido',
}

const ticketValidator = vine.compile(
  vine.object({
    subject: vine.string().trim().minLength(3).maxLength(120),
    description: vine.string().trim().minLength(10).maxLength(4000),
  })
)

const listValidator = vine.compile(
  vine.object({
    page: vine.number().withoutDecimals().min(1).max(1_000_000).optional(),
    status: vine.enum(statuses).optional(),
  })
)

const idValidator = vine.compile(vine.object({ id: vineUuidLike() }))
const replyValidator = vine.compile(vine.object({ body: vine.string().trim().minLength(1).maxLength(4000) }))
const statusValidator = vine.compile(vine.object({ status: vine.enum(statuses) }))
const readValidator = vine.compile(vine.object({ replyId: vineUuidLike() }))

function ticketQuery() {
  return db
    .from('support_tickets')
    .join('users', 'users.id', 'support_tickets.user_id')
    .select(
      'support_tickets.id',
      'support_tickets.subject',
      'support_tickets.description',
      'support_tickets.created_at',
      'support_tickets.updated_at',
      'support_tickets.status',
      'support_tickets.unread_reply_id',
      'users.name as requester_name',
      'users.email as requester_email',
      'users.slug as requester_slug'
    )
}

function professionalId({ authJwt }: HttpContext) {
  return authJwt?.user.role === 'PROFISSIONAL' ? authJwt.user.id : undefined
}

export default class SupportTicketsController {
  async store({ authJwt, request, response }: HttpContext) {
    const user = authJwt?.user
    if (user?.role !== 'PROFISSIONAL') {
      return response.forbidden({ message: 'Acesso restrito a profissionais' })
    }

    const ticket = await request.validateUsing(ticketValidator)
    const id = randomUUID()
    await db.table('support_tickets').insert({ id, user_id: user.id, ...ticket })
    return response.created({ id })
  }

  async index({ request, response }: HttpContext) {
    const { page = 1, status } = await listValidator.validate(request.qs())
    const query = ticketQuery()
    if (status) query.where('support_tickets.status', status)
    const tickets = await query.orderBy('support_tickets.updated_at', 'desc').orderBy('support_tickets.id', 'desc').paginate(page, 20)
    return response.ok(tickets.toJSON())
  }

  async mine(ctx: HttpContext) {
    const { request, response } = ctx
    const userId = professionalId(ctx)
    if (!userId) return response.forbidden()
    const { page = 1 } = await listValidator.validate(request.qs())
    const tickets = await ticketQuery()
      .where('support_tickets.user_id', userId)
      .orderBy('support_tickets.updated_at', 'desc')
      .orderBy('support_tickets.id', 'desc')
      .paginate(page, 20)
    return response.ok(tickets.toJSON())
  }

  async unread(ctx: HttpContext) {
    const userId = professionalId(ctx)
    if (!userId) return ctx.response.forbidden()
    const unread = await db
      .from('support_tickets')
      .where('user_id', userId)
      .whereNotNull('unread_reply_id')
      .select('id')
      .first()
    return ctx.response.ok({ unread: Boolean(unread) })
  }

  async show({ authJwt, params, response }: HttpContext) {
    const user = authJwt?.user
    if (!user) return response.unauthorized()
    const { id } = await idValidator.validate(params)
    const query = ticketQuery().where('support_tickets.id', id)
    if (user.role !== 'SUPERADMIN') query.where('support_tickets.user_id', user.id)
    const ticket = await query.first()
    if (!ticket) return response.notFound()

    const replies = await db
      .from('support_ticket_replies')
      .where('ticket_id', id)
      .orderBy('sequence')
      .select('id', 'author', 'body', 'created_at')
    return response.ok({ ...ticket, replies })
  }

  async reply({ authJwt, params, request, response }: HttpContext) {
    const user = authJwt?.user
    if (!user) return response.unauthorized()
    const { id } = await idValidator.validate(params)
    const { body } = await request.validateUsing(replyValidator)
    const isStaff = user.role === 'SUPERADMIN'

    const saved = await db.transaction(async (trx) => {
      const query = trx.from('support_tickets').where('id', id).forUpdate()
      if (!isStaff) query.where('user_id', user.id)
      const ticket = await query.first()
      if (!ticket) return false

      const replyId = randomUUID()
      await trx.table('support_ticket_replies').insert({
        id: replyId,
        ticket_id: id,
        author: isStaff ? 'SUPPORT' : 'CUSTOMER',
        body,
      })

      let status = ticket.status as (typeof statuses)[number]
      if (isStaff && status === 'OPEN') status = 'IN_PROGRESS'
      if (!isStaff && status === 'WAITING_CUSTOMER') status = 'IN_PROGRESS'
      if (!isStaff && status === 'RESOLVED') status = 'OPEN'

      await trx.from('support_tickets').where('id', id).update({
        status,
        updated_at: trx.raw('clock_timestamp()'),
        ...(isStaff ? { unread_reply_id: replyId } : {}),
      })
      if (status !== ticket.status) {
        await createUserNotification(trx, {
          userId: ticket.user_id,
          kind: 'SUPPORT_STATUS_CHANGED',
          targetId: id,
          description: `“${ticket.subject}” mudou para ${statusLabels[status]}.`,
        })
      }
      return true
    })
    return saved ? response.created({}) : response.notFound()
  }

  async updateStatus({ params, request, response }: HttpContext) {
    const { id } = await idValidator.validate(params)
    const { status } = await request.validateUsing(statusValidator)
    const updated = await db.transaction(async (trx) => {
      const ticket = await trx.from('support_tickets').where('id', id).forUpdate().first()
      if (!ticket) return false
      if (ticket.status === status) return true

      await trx.from('support_tickets').where('id', id).update({
        status,
        updated_at: trx.raw('clock_timestamp()'),
      })
      await createUserNotification(trx, {
        userId: ticket.user_id,
        kind: 'SUPPORT_STATUS_CHANGED',
        targetId: id,
        description: `“${ticket.subject}” mudou para ${statusLabels[status]}.`,
      })
      return true
    })
    return updated ? response.noContent() : response.notFound()
  }

  async markRead(ctx: HttpContext) {
    const { params, request, response } = ctx
    const userId = professionalId(ctx)
    if (!userId) return response.forbidden()
    const { id } = await idValidator.validate(params)
    const { replyId } = await request.validateUsing(readValidator)
    await db.from('support_tickets').where('id', id).where('user_id', userId)
      .where('unread_reply_id', replyId).update({ unread_reply_id: null })
    return response.noContent()
  }
}
