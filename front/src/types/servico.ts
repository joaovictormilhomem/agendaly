export interface Servico {
  id: string
  nome: string
  emoji: string
  descricao: string
  duracao_minutos: number
  preco: number
  ativo: boolean
}

export type ServicoCreate = Omit<Servico, "id">
export type ServicoUpdate = Partial<ServicoCreate>
