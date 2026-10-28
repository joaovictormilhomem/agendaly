import PortfolioImagem from '#models/portfolio_imagem'
import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import { readFile } from 'node:fs/promises'
import crypto from 'node:crypto'

const MAX_IMAGENS = 8
const MAX_TAMANHO_BYTES = 5 * 1024 * 1024
const TIPOS_PERMITIDOS = new Set(['image/jpeg', 'image/png', 'image/webp'])
const serializar = (imagem: PortfolioImagem) => ({ id: imagem.id, url: `/api/public/portfolio/${imagem.id}/imagem`, ordem: imagem.ordem })

async function profissionalAutorizada(slug: string, authJwt: HttpContext['authJwt'], response: HttpContext['response']) {
  const user = await User.query().where('slug', slug).first()
  if (!user) { response.notFound({ message: 'Profissional não encontrada' }); return null }
  if (authJwt!.user.slug !== user.slug && authJwt!.user.role !== 'SUPERADMIN') { response.forbidden({ message: 'Acesso negado' }); return null }
  return user
}

export default class PortfolioController {
  async index({ params, authJwt, response }: HttpContext) {
    const user = await profissionalAutorizada(params.slug, authJwt, response); if (!user) return
    return response.ok((await PortfolioImagem.query().where('user_id', user.id).orderBy('ordem').orderBy('created_at')).map(serializar))
  }
  async publicIndex({ params, response }: HttpContext) {
    const user = await User.query().where('slug', params.slug).first()
    if (!user) return response.notFound({ message: 'Profissional não encontrada' })
    return response.ok((await PortfolioImagem.query().where('user_id', user.id).orderBy('ordem').orderBy('created_at')).map(serializar))
  }
  async store({ params, request, authJwt, response }: HttpContext) {
    const user = await profissionalAutorizada(params.slug, authJwt, response); if (!user) return
    const arquivo = request.file('imagem')
    if (!arquivo || !arquivo.tmpPath) return response.unprocessableEntity({ message: 'Nenhuma imagem válida foi recebida.' })
    if (arquivo.size > MAX_TAMANHO_BYTES) return response.unprocessableEntity({ message: 'A imagem deve ter no máximo 5 MB.' })
    const contentType = `${arquivo.type}/${arquivo.subtype}`
    if (!TIPOS_PERMITIDOS.has(contentType)) return response.unprocessableEntity({ message: 'Use uma imagem JPG, PNG ou WebP.' })
    const existentes = await PortfolioImagem.query().where('user_id', user.id)
    if (existentes.length >= MAX_IMAGENS) return response.unprocessableEntity({ message: `O portfólio aceita no máximo ${MAX_IMAGENS} imagens.` })
    const imagem = await PortfolioImagem.create({ id: crypto.randomUUID(), userId: user.id, contentType, arquivo: await readFile(arquivo.tmpPath), ordem: existentes.length })
    return response.created(serializar(imagem))
  }
  async destroy({ params, authJwt, response }: HttpContext) {
    const user = await profissionalAutorizada(params.slug, authJwt, response); if (!user) return
    const imagem = await PortfolioImagem.query().where('id', params.id).where('user_id', user.id).first()
    if (!imagem) return response.notFound({ message: 'Imagem não encontrada' })
    await imagem.delete(); return response.noContent()
  }
  async image({ params, response }: HttpContext) {
    const imagem = await PortfolioImagem.find(params.id)
    if (!imagem) return response.notFound({ message: 'Imagem não encontrada' })
    response.header('Content-Type', imagem.contentType); response.header('Cache-Control', 'public, max-age=31536000, immutable')
    return response.send(imagem.arquivo)
  }
}
