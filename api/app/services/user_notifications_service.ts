import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import { randomUUID } from 'node:crypto'

export async function createUserNotification(
  trx: TransactionClientContract,
  event: {
    userId: string
    kind: 'BOOKING_CREATED' | 'SUPPORT_STATUS_CHANGED'
    targetId: string
    description: string
  }
) {
  await trx.table('user_notifications').insert({
    id: randomUUID(),
    user_id: event.userId,
    kind: event.kind,
    target_id: event.targetId,
    description: event.description,
    created_at: trx.raw('clock_timestamp()'),
  })
}
