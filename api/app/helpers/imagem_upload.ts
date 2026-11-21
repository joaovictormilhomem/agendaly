import type { HttpContext } from '@adonisjs/core/http'

const tiposPermitidos = new Set(['image/jpeg', 'image/png', 'image/webp'])
const tamanhoMaximo = 5 * 1024 * 1024

export function validarImagemUpload(arquivo: ReturnType<HttpContext['request']['file']>) {
  if (!arquivo?.tmpPath) return { error: 'Nenhuma imagem válida foi recebida.' } as const
  if (arquivo.size > tamanhoMaximo) return { error: 'A imagem deve ter no máximo 5 MB.' } as const

  const contentType = `${arquivo.type}/${arquivo.subtype}`
  if (!tiposPermitidos.has(contentType)) return { error: 'Use uma imagem JPG, PNG ou WebP.' } as const

  return { path: arquivo.tmpPath, contentType } as const
}
