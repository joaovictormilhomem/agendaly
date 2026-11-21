import PortfolioImagem from '#models/portfolio_imagem'
import User from '#models/user'
import { validarImagemUpload } from '#helpers/imagem_upload'
import type { HttpContext } from '@adonisjs/core/http'
import { readFile } from 'node:fs/promises'
import crypto from 'node:crypto'

const MAX_IMAGENS = 8
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
    const upload = validarImagemUpload(request.file('imagem'))
    if ('error' in upload) return response.unprocessableEntity({ message: upload.error })
    const existentes = await PortfolioImagem.query().where('user_id', user.id)
    if (existentes.length >= MAX_IMAGENS) return response.unprocessableEntity({ message: `O portfólio aceita no máximo ${MAX_IMAGENS} imagens.` })
    const imagem = await PortfolioImagem.create({ id: crypto.randomUUID(), userId: user.id, contentType: upload.contentType, arquivo: await readFile(upload.path), ordem: existentes.length })
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
