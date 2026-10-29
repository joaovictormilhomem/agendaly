import LoginThrottle from '#models/login_throttle'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import crypto from 'node:crypto'

/** Tentativas inválidas aceitas antes do bloqueio temporário. */
export const LOGIN_MAX_FAILURES = 5

/** Duração do bloqueio e da janela que zera o contador. */
export const LOGIN_LOCK_MINUTES = 15

export type ThrottleDecision = {
  blocked: boolean
  retryAfterSeconds: number
}

function retryAfter(until: DateTime, now: DateTime) {
  return Math.max(1, Math.ceil(until.diff(now, 'seconds').seconds))
}

/**
 * Limita tentativas de login por IP + e-mail.
 * A chave guardada é um hash, para não gravar o e-mail em texto puro.
 */
export default class LoginThrottleService {
  static subject(ip: string, email: string) {
    const normalized = `${ip}|${email.trim().toLowerCase()}`
    return crypto.createHash('sha256').update(normalized).digest('hex')
  }

  static async check(subject: string): Promise<ThrottleDecision> {
    const now = DateTime.utc()
    const row = await LoginThrottle.findBy('subject', subject)
    if (!row?.lockedUntil || row.lockedUntil <= now) {
      return { blocked: false, retryAfterSeconds: 0 }
    }
    return { blocked: true, retryAfterSeconds: retryAfter(row.lockedUntil, now) }
  }

  static async registerFailure(subject: string): Promise<ThrottleDecision> {
    const now = DateTime.utc()

    return db.transaction(async (trx) => {
      let row = await LoginThrottle.query({ client: trx }).where('subject', subject).forUpdate().first()

      if (!row) {
        row = new LoginThrottle()
        row.id = crypto.randomUUID()
        row.subject = subject
        row.failures = 0
        row.lockedUntil = null
        row.useTransaction(trx)
      }

      if (row.lockedUntil && row.lockedUntil > now) {
        return { blocked: true, retryAfterSeconds: retryAfter(row.lockedUntil, now) }
      }

      const lastTouch = row.updatedAt
      const windowExpired =
        !!lastTouch && now.diff(lastTouch, 'minutes').minutes >= LOGIN_LOCK_MINUTES

      if (windowExpired || (row.lockedUntil && row.lockedUntil <= now)) {
        row.failures = 0
        row.lockedUntil = null
      }

      row.failures += 1

      if (row.failures >= LOGIN_MAX_FAILURES) {
        row.lockedUntil = now.plus({ minutes: LOGIN_LOCK_MINUTES })
        row.failures = 0
        await row.save()
        return { blocked: true, retryAfterSeconds: retryAfter(row.lockedUntil, now) }
      }

      await row.save()
      return { blocked: false, retryAfterSeconds: 0 }
    })
  }

  static async clear(subject: string) {
    const row = await LoginThrottle.findBy('subject', subject)
    if (!row) return
    row.failures = 0
    row.lockedUntil = null
    await row.save()
  }
}
