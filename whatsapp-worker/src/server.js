import express from 'express'
import QRCode from 'qrcode'
import wweb from 'whatsapp-web.js'

const { Client, LocalAuth } = wweb.default ?? wweb

const PORT = Number(process.env.PORT || 3334)
const BRIDGE_SECRET = process.env.WHATSAPP_BRIDGE_SECRET

if (!BRIDGE_SECRET) {
  console.error('Defina WHATSAPP_BRIDGE_SECRET no ambiente.')
  process.exit(1)
}

/** @typedef {{ client: import('whatsapp-web.js').Client | null, state: string, qrDataUrl: string | null, lastError: string | null }} SessionEntry */

/** @type {Map<string, SessionEntry>} */
const sessions = new Map()

function requireAuth(req, res, next) {
  const h = req.headers.authorization
  const token = h?.startsWith('Bearer ') ? h.slice(7) : null
  if (token !== BRIDGE_SECRET) {
    return res.status(401).json({ message: 'Não autorizado' })
  }
  next()
}

function getEntry(userId) {
  let e = sessions.get(userId)
  if (!e) {
    e = { client: null, state: 'disconnected', qrDataUrl: null, lastError: null }
    sessions.set(userId, e)
  }
  return e
}

async function destroyEntryClient(entry) {
  if (!entry.client) return
  try {
    await entry.client.destroy()
  } catch {
    // ignore
  }
  entry.client = null
}

/**
 * @param {string} userId
 */
async function startSession(userId) {
  const entry = getEntry(userId)

  if (entry.state === 'ready' && entry.client) {
    return entry
  }

  if (entry.client && ['starting', 'qr', 'authenticating'].includes(entry.state)) {
    return entry
  }

  await destroyEntryClient(entry)
  entry.state = 'starting'
  entry.qrDataUrl = null
  entry.lastError = null

  const client = new Client({
    authStrategy: new LocalAuth({ clientId: `agendaly-${userId}` }),
    puppeteer: {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    },
  })

  client.on('qr', async (qr) => {
    try {
      entry.qrDataUrl = await QRCode.toDataURL(qr)
      entry.state = 'qr'
    } catch (err) {
      entry.lastError = err instanceof Error ? err.message : 'qr_fail'
      entry.state = 'error'
    }
  })

  client.on('authenticated', () => {
    entry.state = 'authenticating'
  })

  client.on('ready', () => {
    entry.state = 'ready'
    entry.qrDataUrl = null
  })

  client.on('auth_failure', (msg) => {
    entry.lastError = String(msg)
    entry.state = 'error'
  })

  client.on('disconnected', async () => {
    entry.state = 'disconnected'
    entry.qrDataUrl = null
    await destroyEntryClient(entry)
  })

  entry.client = client

  client.initialize().catch((err) => {
    entry.lastError = err instanceof Error ? err.message : String(err)
    entry.state = 'error'
    entry.client = null
  })

  return entry
}

const app = express()
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ ok: true })
})

app.use(requireAuth)

app.get('/sessions/:userId', (req, res) => {
  const entry = getEntry(req.params.userId)
  res.json({
    state: entry.state,
    qr_data_url: entry.state === 'qr' ? entry.qrDataUrl : null,
    error: entry.lastError,
  })
})

app.post('/sessions/:userId/start', async (req, res) => {
  try {
    const entry = await startSession(req.params.userId)
    res.json({
      state: entry.state,
      qr_data_url: entry.state === 'qr' ? entry.qrDataUrl : null,
      error: entry.lastError,
    })
  } catch (err) {
    res.status(500).json({ message: err instanceof Error ? err.message : 'erro' })
  }
})

app.post('/sessions/:userId/logout', async (req, res) => {
  const entry = getEntry(req.params.userId)
  try {
    if (entry.client) {
      await entry.client.logout().catch(() => {})
      await entry.client.destroy().catch(() => {})
    }
  } finally {
    entry.client = null
    entry.state = 'disconnected'
    entry.qrDataUrl = null
    entry.lastError = null
  }
  res.json({ ok: true })
})

/**
 * Lista de candidatos de dígitos (ex.: reforço 55 se vier só DDD+número).
 * @param {string} digits
 */
function digitCandidates(digits) {
  const d = digits.replace(/\D/g, '')
  if (!d) return []
  const out = []
  const add = (x) => {
    if (x && !out.includes(x)) out.push(x)
  }
  add(d)
  if (!d.startsWith('55') && (d.length === 10 || d.length === 11)) {
    add(`55${d}`)
  }
  return out
}

/**
 * JIDs a tentar, em ordem de prioridade.
 * @param {string} d
 * @param {string[]} extra após getNumberId / LID
 */
function buildChatIdOrder(d, extra) {
  const order = []
  const add = (id) => {
    if (id && !order.includes(id)) order.push(id)
  }
  // Primeiro o formato clássico PN (o patch de LID no getChat atua aqui).
  add(`${d}@c.us`)
  add(`${d}@s.whatsapp.net`)
  for (const id of extra) add(id)
  return order
}

/**
 * @param {import('whatsapp-web.js').Client} client
 * @param {string} digits
 * @param {string} message
 * @returns {Promise<{ sent: import('whatsapp-web.js').Message, chat_id: string, digits_used: string } | null>}
 */
async function sendWithBestChatId(client, digits, message) {
  for (const cand of digitCandidates(digits)) {
    const extra = []

    try {
      const nid = await client.getNumberId(cand)
      if (nid?._serialized) extra.push(nid._serialized)
      if (nid?.user && nid?.server) extra.push(`${nid.user}@${nid.server}`)
    } catch {
      /* número pode não existir no WA */
    }

    try {
      if (typeof client.getContactLidAndPhone === 'function') {
        const rows = await client.getContactLidAndPhone([`${cand}@c.us`])
        const r = Array.isArray(rows) ? rows[0] : rows
        if (r?.pn) extra.push(r.pn)
        if (r?.lid) extra.push(r.lid)
      }
    } catch {
      /* ignora */
    }

    const chatIds = buildChatIdOrder(cand, extra)

    for (const chatId of chatIds) {
      const sent = await client.sendMessage(chatId, message)
      if (sent) return { sent, chat_id: chatId, digits_used: cand }
    }
  }
  return null
}

app.post('/send', async (req, res) => {
  const { userId, to, message } = req.body || {}
  if (!userId || typeof to !== 'string' || typeof message !== 'string') {
    return res.status(400).json({ message: 'userId, to e message são obrigatórios' })
  }
  const digits = to.replace(/\D/g, '')
  if (!digits || message.length > 4000) {
    return res.status(400).json({ message: 'Destino ou mensagem inválidos' })
  }

  const entry = getEntry(userId)
  if (!entry.client || entry.state !== 'ready') {
    return res.status(503).json({ message: 'WhatsApp não está pronto para envio' })
  }

  try {
    const result = await sendWithBestChatId(entry.client, digits, message)
    if (!result) {
      return res.status(502).json({
        message:
          'WhatsApp nao entregou: nenhum chatId funcionou para este numero. Verifique DDI (ex. 55), se o destino tem WhatsApp e abra um chat manualmente com esse contato no aparelho conectado.',
      })
    }

    const messageId = result.sent?.id?._serialized
    res.json({
      ok: true,
      chat_id: result.chat_id,
      digits_used: result.digits_used,
      ...(messageId ? { message_id: messageId } : {}),
    })
  } catch (err) {
    res.status(500).json({ message: err instanceof Error ? err.message : 'send_fail' })
  }
})

app.listen(PORT, () => {
  console.log(`whatsapp-worker ouvindo em :${PORT}`)
})
