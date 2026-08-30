export interface ServicoIncremento {
  id: string
  nome: string
  duracao_minutos: number
  preco: number
  obrigatorio: boolean
  ordem: number
}

export type ServicoIncrementoInput = {
  id?: string
  nome: string
  duracao_minutos: number
  preco: number
  obrigatorio: boolean
  ordem?: number
}

export interface Servico {
  id: string
  nome: string
  emoji: string
  descricao: string
  /** Preço de listagem (base ou "a partir de" com especificações). */
  duracao_minutos: number
  preco: number
  preco_base?: number
  duracao_base_minutos?: number
  ativo: boolean
  tem_incrementos?: boolean
  incrementos: ServicoIncremento[]
}

export type ServicoCreate = {
  nome: string
  emoji: string
  descricao: string
  duracao_minutos: number
  preco: number
  ativo: boolean
  incrementos: ServicoIncrementoInput[]
}

export type ServicoUpdate = Partial<ServicoCreate>

/** Totais a partir das especificações escolhidas (ou base, se não houver). */
export function totaisServico(
  servico: Servico,
  incrementoIds: string[]
): { preco: number; duracao_minutos: number; incrementos: ServicoIncremento[] } {
  const lista = servico.incrementos ?? []
  if (lista.length === 0) {
    return {
      preco: servico.preco_base ?? servico.preco,
      duracao_minutos: servico.duracao_base_minutos ?? servico.duracao_minutos,
      incrementos: [],
    }
  }
  const selected = new Set(incrementoIds)
  for (const inc of lista) {
    if (inc.obrigatorio) selected.add(inc.id)
  }
  const escolhidos = lista.filter((i) => selected.has(i.id))
  return {
    preco: escolhidos.reduce((s, i) => s + i.preco, 0),
    duracao_minutos: escolhidos.reduce((s, i) => s + i.duracao_minutos, 0),
    incrementos: escolhidos,
  }
}

export function idsObrigatorios(servico: Servico): string[] {
  return (servico.incrementos ?? []).filter((i) => i.obrigatorio).map((i) => i.id)
}

export function formatPrecoServico(servico: Servico): string {
  const valor = servico.preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
  if ((servico.incrementos?.length ?? 0) > 0) return `A partir de ${valor}`
  return valor
}
