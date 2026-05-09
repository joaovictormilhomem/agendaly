export interface Intervalo {
  hora_inicio: string
  hora_fim: string
}

export interface DiaSemana {
  dia: 0 | 1 | 2 | 3 | 4 | 5 | 6
  ativo: boolean
  intervalos: Intervalo[]
}

export interface Bloqueio {
  id: string
  data: string   // "YYYY-MM-DD"
  motivo: string
}

export interface Disponibilidade {
  dias: DiaSemana[]
  intervalo_atendimento_minutos: number
  bloqueios: Bloqueio[]
}
