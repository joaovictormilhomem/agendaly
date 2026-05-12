import { useMutation, useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Phone, Mail, Clock, CalendarDays, CheckCircle2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { StatusChip } from "@/components/shared/StatusChip"
import { confirmarAgendamento } from "@/api/admin/agenda"
import type { Agendamento } from "@/types/agenda"

interface Props {
  agendamento: Agendamento | null
  open: boolean
  onOpenChange: (open: boolean) => void
  slug: string
}

function Detail({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary shrink-0">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  )
}

export function DetalhesAgendamentoDialog({ agendamento, open, onOpenChange, slug }: Props) {
  const qc = useQueryClient()

  const { mutate: confirmar, isPending: confirming } = useMutation({
    mutationFn: () => confirmarAgendamento(slug, agendamento!.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["agenda", slug] })
      qc.invalidateQueries({ queryKey: ["dashboard", slug] })
      onOpenChange(false)
    },
  })

  if (!agendamento) return null

  const inicio = new Date(agendamento.data_hora_inicio)
  const fim = new Date(agendamento.data_hora_fim)
  const dateLabel = format(inicio, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })
  const timeLabel = `${format(inicio, "HH:mm")} – ${format(fim, "HH:mm")}`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between gap-3 pr-6">
            <DialogTitle className="font-playfair">{agendamento.cliente_nome}</DialogTitle>
            <StatusChip status={agendamento.status} />
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2 rounded-lg bg-secondary/50 px-3 py-2">
            <span className="text-xl">{agendamento.servico_emoji}</span>
            <p className="text-sm font-semibold text-foreground">{agendamento.servico_nome}</p>
          </div>

          <div className="space-y-3">
            <Detail icon={CalendarDays} label="Data" value={dateLabel} />
            <Detail icon={Clock} label="Horário" value={timeLabel} />
            {agendamento.cliente_whatsapp && (
              <Detail icon={Phone} label="Telefone" value={agendamento.cliente_whatsapp} />
            )}
            {agendamento.cliente_email && (
              <Detail icon={Mail} label="E-mail" value={agendamento.cliente_email} />
            )}
          </div>
        </div>

        {agendamento.status === "PENDENTE" && (
          <DialogFooter>
            <Button
              className="rounded-full gap-1.5"
              disabled={confirming}
              onClick={() => confirmar()}
            >
              <CheckCircle2 className="h-4 w-4" />
              {confirming ? "Confirmando..." : "Confirmar agendamento"}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
