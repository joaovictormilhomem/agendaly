import type { Disponibilidade } from "@/types/disponibilidade"

export const disponibilidadeMock: Disponibilidade = {
  intervalo_atendimento_minutos: 30,
  dias: [
    { dia: 0, ativo: true,  intervalos: [{ hora_inicio: "09:00", hora_fim: "12:00" }, { hora_inicio: "13:00", hora_fim: "18:00" }] },
    { dia: 1, ativo: true,  intervalos: [{ hora_inicio: "09:00", hora_fim: "12:00" }, { hora_inicio: "13:00", hora_fim: "18:00" }] },
    { dia: 2, ativo: true,  intervalos: [{ hora_inicio: "09:00", hora_fim: "12:00" }, { hora_inicio: "13:00", hora_fim: "18:00" }] },
    { dia: 3, ativo: true,  intervalos: [{ hora_inicio: "09:00", hora_fim: "12:00" }] },
    { dia: 4, ativo: true,  intervalos: [{ hora_inicio: "09:00", hora_fim: "12:00" }] },
    { dia: 5, ativo: false, intervalos: [] },
    { dia: 6, ativo: false, intervalos: [] },
  ],
  bloqueios: [
    { id: "b-001", data: "2026-03-05", motivo: "Folga pessoal" },
    { id: "b-002", data: "2026-03-20", motivo: "Curso de atualização" },
  ],
}
