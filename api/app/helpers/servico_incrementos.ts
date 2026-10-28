import type ServicoIncremento from '#models/servico_incremento'
import type Servico from '#models/servico'

export type IncrementoResolvido = {
  id: string
  nome: string
  duracao_minutos: number
  preco: number
  obrigatorio: boolean
  adicionais: { id: string; nome: string; duracao_minutos: number; preco: number }[]
}

export type TotaisServico = {
  duracao_minutos: number
  preco: number
  incrementos: IncrementoResolvido[]
}

export function serializeIncremento(i: ServicoIncremento) {
  return {
    id: i.id,
    nome: i.nome,
    duracao_minutos: i.duracaoMinutos,
    preco: Number(i.preco),
    obrigatorio: i.obrigatorio,
    ordem: i.ordem,
    adicionais: [...(i.adicionais ?? [])]
      .sort((a, b) => a.ordem - b.ordem || a.nome.localeCompare(b.nome))
      .map((a) => ({
        id: a.id,
        nome: a.nome,
        duracao_minutos: a.duracaoMinutos,
        preco: Number(a.preco),
        ordem: a.ordem,
      })),
  }
}

export function duracaoIncrementoValida(duracao: number) {
  return duracao >= 15 && duracao % 15 === 0
}

/**
 * Quando o serviço tem especificações (mão, pé, etc.), preço e duração
 * vêm só da soma das escolhidas. Sem especificações, usa o serviço base.
 */
export function resolverTotaisServico(
  servico: Servico,
  incrementosDoServico: ServicoIncremento[],
  incrementoIdsSelecionados: string[] | undefined | null,
  adicionalIdsSelecionados: string[] | undefined | null = []
): { ok: true; totais: TotaisServico } | { ok: false; message: string } {
  if (incrementosDoServico.length === 0) {
    if ((incrementoIdsSelecionados && incrementoIdsSelecionados.length > 0) || (adicionalIdsSelecionados?.length ?? 0) > 0) {
      return { ok: false, message: 'Este serviço não possui especificações' }
    }
    return {
      ok: true,
      totais: {
        duracao_minutos: servico.duracaoMinutos,
        preco: Number(servico.preco),
        incrementos: [],
      },
    }
  }

  const byId = new Map(incrementosDoServico.map((i) => [i.id, i]))
  const selectedIds = [...new Set(incrementoIdsSelecionados ?? [])]

  for (const id of selectedIds) {
    if (!byId.has(id)) {
      return { ok: false, message: 'Especificação inválida para este serviço' }
    }
  }

  const selected = new Set(selectedIds)
  for (const inc of incrementosDoServico) {
    if (inc.obrigatorio) selected.add(inc.id)
  }

  if (selected.size === 0) {
    return {
      ok: false,
      message: 'Selecione ao menos uma especificação do serviço (ex.: mão, pé)',
    }
  }

  const resolvidos: IncrementoResolvido[] = []
  let duracao = 0
  let preco = 0
  for (const id of selected) {
    const inc = byId.get(id)!
    resolvidos.push({
      id: inc.id,
      nome: inc.nome,
      duracao_minutos: inc.duracaoMinutos,
      preco: Number(inc.preco),
      obrigatorio: inc.obrigatorio,
      adicionais: [],
    })
    duracao += inc.duracaoMinutos
    preco += Number(inc.preco)
  }

  const adicionaisPorId = new Map(
    incrementosDoServico.flatMap((inc) =>
      (inc.adicionais ?? []).map((a) => [a.id, { adicional: a, incrementoId: inc.id }] as const)
    )
  )
  const adicionaisSelecionados = [...new Set(adicionalIdsSelecionados ?? [])]
  for (const id of adicionaisSelecionados) {
    const encontrado = adicionaisPorId.get(id)
    if (!encontrado || !selected.has(encontrado.incrementoId)) {
      return { ok: false, message: 'Adicional invÃ¡lido para as especificaÃ§Ãµes selecionadas' }
    }
    const destino = resolvidos.find((inc) => inc.id === encontrado.incrementoId)!
    const adicional = encontrado.adicional
    destino.adicionais.push({
      id: adicional.id,
      nome: adicional.nome,
      duracao_minutos: adicional.duracaoMinutos,
      preco: Number(adicional.preco),
    })
    duracao += adicional.duracaoMinutos
    preco += Number(adicional.preco)
  }

  resolvidos.sort((a, b) => {
    const oa = byId.get(a.id)?.ordem ?? 0
    const ob = byId.get(b.id)?.ordem ?? 0
    return oa - ob || a.nome.localeCompare(b.nome)
  })

  if (duracao < 15 || duracao % 15 !== 0) {
    return {
      ok: false,
      message: 'A duração total das especificações deve ser de no mínimo 15 minutos e múltipla de 15',
    }
  }

  return {
    ok: true,
    totais: {
      duracao_minutos: duracao,
      preco,
      incrementos: resolvidos,
    },
  }
}

/** Preço mínimo exibido na listagem (obrigatórios; ou menor opcional se não houver obrigatório). */
export function precoAPartirDe(servico: Servico, incrementos: ServicoIncremento[]): number {
  if (incrementos.length === 0) return Number(servico.preco)
  const obrigatorios = incrementos.filter((i) => i.obrigatorio)
  if (obrigatorios.length === 0) {
    return Math.min(...incrementos.map((i) => Number(i.preco)))
  }
  return obrigatorios.reduce((s, i) => s + Number(i.preco), 0)
}

export function duracaoAPartirDe(servico: Servico, incrementos: ServicoIncremento[]): number {
  if (incrementos.length === 0) return servico.duracaoMinutos
  const obrigatorios = incrementos.filter((i) => i.obrigatorio)
  if (obrigatorios.length === 0) {
    return Math.min(...incrementos.map((i) => i.duracaoMinutos))
  }
  return obrigatorios.reduce((s, i) => s + i.duracaoMinutos, 0)
}
