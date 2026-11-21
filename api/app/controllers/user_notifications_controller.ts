import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import vine from '@vinejs/vine'
import { vineUuidLike } from '#validators/common'

const readValidator = vine.compile(vine.object({ id: vineUuidLike().optional() }))

export default class UserNotificationsController {
  async index({ authJwt, response }: HttpContext) {
    const user = authJwt?.user
    if (user?.role !== 'PROFISSIONAL') return response.forbidden()

    const notifications = db.from('user_notifications').where('user_id', user.id).whereNull('read_at')
    const [items, count] = await Promise.all([
      notifications.clone()
        .select('id', 'kind', 'target_id', 'description', 'created_at')
        .orderBy('created_at', 'desc').orderBy('id', 'desc').limit(20),
      notifications.clone().count('* as total').first(),
    ])
    return response.ok({ items, unread: Number(count?.total ?? 0) })
  }

  async read({ authJwt, request, response }: HttpContext) {
    const user = authJwt?.user
    if (user?.role !== 'PROFISSIONAL') return response.forbidden()

    const { id } = await request.validateUsing(readValidator)
    const notifications = db.from('user_notifications').where('user_id', user.id).whereNull('read_at')
    if (id) notifications.where('id', id)
    await notifications.update({ read_at: db.raw('clock_timestamp()') })
    return response.noContent()
  }
}
