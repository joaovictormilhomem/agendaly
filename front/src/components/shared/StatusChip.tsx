import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { AgendamentoStatus } from "@/types/agenda"

const config: Record<AgendamentoStatus, { label: string; className: string }> = {
  CONFIRMADO: {
    label: "Confirmado",
    className: "border-transparent text-[#519670] bg-[#E8F5EE] hover:bg-[#E8F5EE]",
  },
  PENDENTE: {
    label: "Pendente",
    className: "border-transparent text-[#92650A] bg-[#FEF3C7] hover:bg-[#FEF3C7]",
  },
  CANCELADO: {
    label: "Cancelado",
    className: "border-transparent text-[#B91C1C] bg-[#FEE2E2] hover:bg-[#FEE2E2]",
  },
}

export function StatusChip({ status, className }: { status: AgendamentoStatus; className?: string }) {
  const { label, className: chipClass } = config[status]
  return (
    <Badge variant="outline" className={cn(chipClass, "text-[10px] font-semibold", className)}>
      {label}
    </Badge>
  )
}
