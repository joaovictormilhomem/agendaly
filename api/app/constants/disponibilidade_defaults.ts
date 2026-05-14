/** Convenção igual ao JS `Date.getDay()`: 0 = domingo … 6 = sábado. */
export const DEFAULT_DIAS = [0, 1, 2, 3, 4, 5, 6].map((dia) => ({
  dia,
  ativo: dia >= 1 && dia <= 5,
  intervalos:
    dia >= 1 && dia <= 5
      ? [
          { hora_inicio: '09:00', hora_fim: '12:00' },
          { hora_inicio: '13:00', hora_fim: '18:00' },
        ]
      : [],
}))
