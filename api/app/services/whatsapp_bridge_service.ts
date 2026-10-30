import env from '#start/env'
import logger from '@adonisjs/core/services/logger'

const BRIDGE_TIMEOUT_MS = 15_000

type SessionStateResponse = {
  state: string
  qr_data_url: string | null
  error: string | null
}

export type WhatsappSendResult = {
  ok: boolean
  erro: string | null
  chatId: string | null
  messageId: string | null
  statusHttp: number | null
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
        signal: AbortSignal.timeout(BRIDGE_TIMEOUT_MS),
      })
      if (!res.ok) {
        logger.warn({ status: res.status, userId }, '[whatsapp-bridge] status http erro')
        return { state: 'error', qr_data_url: null, error: `http_${res.status}` }
      }
      return (await res.json()) as SessionStateResponse
    } catch (e) {
      logger.warn({ err: e, userId }, '[whatsapp-bridge] status falhou')
      return {
        state: 'error',
        qr_data_url: null,
        error: e instanceof Error && e.name === 'TimeoutError' ? 'timeout' : 'network',
      }
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

  async sendText(userId: string, toDigits: string, message: string): Promise<WhatsappSendResult> {
    if (!this.isEnabled()) {
      return { ok: false, erro: 'WhatsApp não está configurado no servidor', chatId: null, messageId: null, statusHttp: null }
    }
    try {
      const res = await fetch(`${this.baseUrl}/send`, {
        method: 'POST',
        headers: this.authHeaders(),
        body: JSON.stringify({ userId, to: toDigits, message }),
        signal: AbortSignal.timeout(BRIDGE_TIMEOUT_MS),
      })
      const body = await res.text()
      if (!res.ok) {
        const erro = mensagemDeErro(res.status, body)
        logger.warn({ status: res.status, body, userId }, '[whatsapp-bridge] send falhou')
        return { ok: false, erro, chatId: null, messageId: null, statusHttp: res.status }
      }
      const parsed = parseJson(body)
      return {
        ok: true,
        erro: null,
        chatId: textoOuNull(parsed?.chat_id),
        messageId: textoOuNull(parsed?.message_id),
        statusHttp: res.status,
      }
    } catch (e) {
      logger.warn({ err: e, userId }, '[whatsapp-bridge] send exceção')
      const timeout = e instanceof Error && e.name === 'TimeoutError'
      return {
        ok: false,
        erro: timeout ? 'Tempo esgotado ao contactar o WhatsApp' : 'Falha de rede ao contactar o WhatsApp',
        chatId: null,
        messageId: null,
        statusHttp: null,
      }
    }
  }
}

function parseJson(body: string): { chat_id?: unknown; message_id?: unknown; message?: unknown } | null {
  try {
    return JSON.parse(body) as { chat_id?: unknown; message_id?: unknown; message?: unknown }
  } catch {
    return null
  }
}

function textoOuNull(value: unknown): string | null {
  return typeof value === 'string' && value.trim() !== '' ? value : null
}

function mensagemDeErro(status: number, body: string): string {
  const parsed = parseJson(body)
  if (typeof parsed?.message === 'string' && parsed.message.trim()) {
    return parsed.message.trim().slice(0, 1000)
  }
  const texto = body.trim()
  if (texto) return texto.slice(0, 1000)
  return `Falha no envio (HTTP ${status})`
}
