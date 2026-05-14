/**
 * Combina data do calendário e horário HH:mm no fuso local do navegador e retorna ISO UTC (BE-7 / padronização ISO).
 */
export function combineDateAndTimeToIso(date: Date, timeHHmm: string): string {
  const [h, m] = timeHHmm.split(":").map(Number)
  const d = new Date(date)
  d.setHours(h, m, 0, 0)
  return d.toISOString()
}
