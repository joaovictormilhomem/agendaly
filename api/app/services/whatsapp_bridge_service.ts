import env from '#start/env'
import logger from '@adonisjs/core/services/logger'

type SessionStateResponse = {
  state: string
  qr_data_url: string | null
  error: string | null
}

export default class WhatsappBridgeService {
  private get baseUrl(): string | undefined {
    const u = env.get('WHATSAPP_BRIDGE_URL')
    return u && u.trim() !== '' ? u.replace(/\/$/, '') : undefined
  }

  private get secret(): string | undefined {
    const s = env.get('WHATSAPP_BRIDGE_SECRET')
    return s && s.trim() !== '' ? s : undefined
  }

  isEnabled(): boolean {
    return Boolean(this.baseUrl && this.secret)
  }

  private authHeaders(): Record<string, string> {
    return {
      'Authorization': `Bearer ${this.secret!}`,
      'Content-Type': 'application/json',
    }
  }

  async getSessionStatus(userId: string): Promise<SessionStateResponse | null> {
    if (!this.isEnabled()) return null
    try {
      const res = await fetch(`${this.baseUrl}/sessions/${encodeURIComponent(userId)}`, {
        headers: this.authHeaders(),
      })
      if (!res.ok) {
        logger.warn({ status: res.status, userId }, '[whatsapp-bridge] status http erro')
        return { state: 'error', qr_data_url: null, error: `http_${res.status}` }
      }
      return (await res.json()) as SessionStateResponse
    } catch (e) {
      logger.warn({ err: e, userId }, '[whatsapp-bridge] status falhou')
      return { state: 'error', qr_data_url: null, error: 'network' }
    }
  }

  async startSession(userId: string): Promise<SessionStateResponse | null> {
    if (!this.isEnabled()) return null
    const res = await fetch(`${this.baseUrl}/sessions/${encodeURIComponent(userId)}/start`, {
      method: 'POST',
      headers: this.authHeaders(),
    })
    if (!res.ok) {
      const t = await res.text()
      throw new Error(t || `HTTP ${res.status}`)
    }
    return (await res.json()) as SessionStateResponse
  }

  async logoutSession(userId: string): Promise<void> {
    if (!this.isEnabled()) return
    const res = await fetch(`${this.baseUrl}/sessions/${encodeURIComponent(userId)}/logout`, {
      method: 'POST',
      headers: this.authHeaders(),
    })
    if (!res.ok) {
      const t = await res.text()
      throw new Error(t || `HTTP ${res.status}`)
    }
  }

  async sendText(userId: string, toDigits: string, message: string): Promise<boolean> {
    if (!this.isEnabled()) return false
    try {
      const res = await fetch(`${this.baseUrl}/send`, {
        method: 'POST',
        headers: this.authHeaders(),
        body: JSON.stringify({ userId, to: toDigits, message }),
      })
      if (!res.ok) {
        const body = await res.text()
        logger.warn({ status: res.status, body, userId }, '[whatsapp-bridge] send falhou')
        return false
      }
      return true
    } catch (e) {
      logger.warn({ err: e, userId }, '[whatsapp-bridge] send exceção')
      return false
    }
  }
}
