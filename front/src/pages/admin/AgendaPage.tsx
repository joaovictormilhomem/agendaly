import { useState } from "react"
import { useParams } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { StatusChip } from "@/components/shared/StatusChip"
import { NovoAgendamentoDialog } from "@/components/agenda/NovoAgendamentoDialog"
import { DetalhesAgendamentoDialog } from "@/components/agenda/DetalhesAgendamentoDialog"
import { getAgenda, cancelarAgendamento } from "@/api/admin/agenda"
import { cn } from "@/lib/utils"
import type { Agendamento } from "@/types/agenda"

type ViewMode = "dia" | "semana" | "mes"

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

interface AgendamentoCardProps {
  item: Agendamento
  onDetalhes: (item: Agendamento) => void
  onCancelar: (item: Agendamento) => void
}

function AgendamentoCard({ item, onDetalhes, onCancelar }: AgendamentoCardProps) {
  const inicio = formatTime(item.data_hora_inicio)
  const fim = formatTime(item.data_hora_fim)
  const isCancelado = item.status === "CANCELADO"

  return (
    <div className={cn("flex gap-4 py-4 border-b border-border last:border-0", isCancelado && "opacity-50")}>
      {/* Time column */}
      <div className="w-16 shrink-0 text-right">
        <p className="text-sm font-semibold text-primary">{inicio}</p>
        <p className="text-xs text-muted-foreground">{fim}</p>
      </div>

      {/* Divider */}
      <div className="flex flex-col items-center gap-1 shrink-0">
        <div className="w-2 h-2 rounded-full bg-primary mt-1" />
        <div className="w-px flex-1 bg-border" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <p className="text-sm font-semibold text-foreground">{item.cliente_nome}</p>
            <p className="text-xs text-muted-foreground">{item.servico_nome}</p>
          </div>
          <StatusChip status={item.status} />
        </div>
        {!isCancelado && (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="rounded-full text-xs h-7"
              onClick={() => onDetalhes(item)}
            >
              Detalhes
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="rounded-full text-xs h-7 text-destructive border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
              onClick={() => onCancelar(item)}
            >
              Cancelar
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export function AgendaPage() {
  const { slug } = useParams<{ slug: string }>()
  const qc = useQueryClient()
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>("dia")
  const [novoOpen, setNovoOpen] = useState(false)
  const [detalhesItem, setDetalhesItem] = useState<Agendamento | null>(null)
  const [cancelarItem, setCancelarItem] = useState<Agendamento | null>(null)

  const dateKey = format(selectedDate, "yyyy-MM-dd")

  const { data: agendamentos = [], isLoading } = useQuery({
    queryKey: ["agenda", slug, dateKey],
    queryFn: () => getAgenda(slug!, selectedDate),
    enabled: !!slug,
  })

  const { mutate: confirmarCancelamento, isPending: canceling } = useMutation({
    mutationFn: () => cancelarAgendamento(slug!, cancelarItem!.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["agenda", slug] })
      qc.invalidateQueries({ queryKey: ["dashboard", slug] })
      setCancelarItem(null)
    },
  })

  const dayLabel = capitalize(
    format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })
  )

  const activeCount = agendamentos.filter((a) => a.status !== "CANCELADO").length

  const viewButtons: { key: ViewMode; label: string }[] = [
    { key: "dia", label: "Dia" },
    { key: "semana", label: "Semana" },
    { key: "mes", label: "Mês" },
  ]

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground font-playfair">Agenda</h1>

        {/* View toggle */}
        <div className="flex rounded-full border border-border overflow-hidden">
          {viewButtons.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setViewMode(key)}
              className={cn(
                "px-4 py-1.5 text-sm font-medium transition-colors",
                viewMode === key
                  ? "bg-primary text-primary-foreground"
                  : "bg-background text-foreground hover:bg-accent"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-[auto_1fr] gap-4 items-start">
        {/* Mini calendar */}
        <Card className="border border-border p-1 w-fit bg-white">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(d) => d && setSelectedDate(d)}
            locale={ptBR}
            className="p-3 bg-white"
          />
        </Card>

        {/* Day panel */}
        <Card className="border border-border min-h-[400px] pb-0 gap-0">
          {/* Day panel header */}
          <div className="flex items-center justify-between px-5 pb-4 border-b border-border">
            <div>
              <p className="text-base font-semibold text-foreground">{dayLabel}</p>
              {isLoading ? (
                <Skeleton className="h-3 w-28 mt-1" />
              ) : (
                <p className="text-xs text-muted-foreground">
                  {activeCount} {activeCount === 1 ? "agendamento" : "agendamentos"}
                </p>
              )}
            </div>
            <Button
              size="sm"
              className="rounded-full gap-1.5"
              onClick={() => setNovoOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Novo
            </Button>
          </div>

          {/* Appointment list */}
          <div className="px-5">
            {isLoading ? (
              <div className="space-y-0">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex gap-4 py-4 border-b border-border last:border-0">
                    <div className="w-16 shrink-0 space-y-1">
                      <Skeleton className="h-4 w-12 ml-auto" />
                      <Skeleton className="h-3 w-10 ml-auto" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-36" />
                      <Skeleton className="h-3 w-24" />
                      <div className="flex gap-2">
                        <Skeleton className="h-7 w-20 rounded-full" />
                        <Skeleton className="h-7 w-20 rounded-full" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : agendamentos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="text-sm font-medium text-foreground">Nenhum agendamento neste dia</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Clique em "+ Novo" para adicionar um agendamento manualmente
                </p>
              </div>
            ) : (
              agendamentos.map((item) => (
                <AgendamentoCard
                  key={item.id}
                  item={item}
                  onDetalhes={setDetalhesItem}
                  onCancelar={setCancelarItem}
                />
              ))
            )}
          </div>
        </Card>
      </div>

      <NovoAgendamentoDialog
        open={novoOpen}
        onOpenChange={setNovoOpen}
        slug={slug!}
        initialDate={selectedDate}
      />

      <DetalhesAgendamentoDialog
        agendamento={detalhesItem}
        open={!!detalhesItem}
        onOpenChange={(o) => { if (!o) setDetalhesItem(null) }}
        slug={slug!}
      />

      <AlertDialog open={!!cancelarItem} onOpenChange={(o) => { if (!o) setCancelarItem(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar agendamento?</AlertDialogTitle>
            <AlertDialogDescription>
              O agendamento de <strong>{cancelarItem?.cliente_nome}</strong> ({cancelarItem?.servico_nome}) será cancelado. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Voltar</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={canceling}
              onClick={() => confirmarCancelamento()}
            >
              {canceling ? "Cancelando..." : "Sim, cancelar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
