import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import { listSupportTickets, ticketStatuses, type TicketStatus } from "@/api/support"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/hooks/useAuth"
import { TicketStatusBadge } from "./TicketStatusBadge"

export const ticketDate = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" })

export function TicketList({ staff = false }: { staff?: boolean }) {
  const { user } = useAuth()
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<TicketStatus | "all">("all")
  const tickets = useQuery({
    queryKey: ["support", user?.id, "list", staff, page, status],
    queryFn: () => listSupportTickets(page, staff, status === "all" ? undefined : status),
  })
  const lastPage = tickets.data?.meta.lastPage ?? 1

  return (
    <section aria-label={staff ? "Fila de atendimento" : "Meus chamados"} className="space-y-4">
      {staff ? (
        <div className="flex flex-wrap items-center gap-2">
          <Label htmlFor="support-status-filter">Filtrar por status</Label>
          <Select
            value={status}
            onValueChange={(value) => {
              setStatus(value as TicketStatus | "all")
              setPage(1)
            }}
          >
            <SelectTrigger id="support-status-filter" size="sm" className="w-44 max-w-full bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="all">Todos</SelectItem>
              {(Object.keys(ticketStatuses) as TicketStatus[]).map((value) => (
                <SelectItem key={value} value={value} textValue={ticketStatuses[value]}>
                  <TicketStatusBadge status={value} />
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : <h2 className="font-playfair text-2xl font-bold">Meus chamados</h2>}

      {tickets.isPending && <p role="status" className="text-sm text-muted-foreground">Carregando chamados…</p>}
      {tickets.isError && (
        <div className="flex flex-wrap items-center gap-3">
          <p role="alert" className="text-sm text-destructive">Não foi possível carregar os chamados.</p>
          <Button variant="outline" size="sm" onClick={() => tickets.refetch()}>Tentar novamente</Button>
        </div>
      )}
      {tickets.data?.data.length === 0 && <p className="text-sm text-muted-foreground">Nenhum chamado encontrado.</p>}
      {tickets.data?.data.map((ticket) => (
        <Card key={ticket.id} className="py-4">
          <CardContent className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Link className="break-all font-semibold text-primary underline-offset-4 hover:underline" to={ticket.id}>
                {ticket.subject}
              </Link>
              <TicketStatusBadge status={ticket.status} />
              {!staff && ticket.unread_reply_id && <Badge>Nova resposta</Badge>}
            </div>
            <div className="flex flex-wrap gap-x-3 text-sm text-muted-foreground">
              {staff && <span className="break-all">{ticket.requester_name} · {ticket.requester_email}</span>}
              <time dateTime={ticket.updated_at}>Atualizado em {ticketDate.format(new Date(ticket.updated_at))}</time>
            </div>
          </CardContent>
        </Card>
      ))}
      {(page > 1 || lastPage > 1) && (
        <nav aria-label="Paginação dos chamados" className="flex flex-wrap items-center gap-3">
          <Button variant="outline" disabled={page === 1} onClick={() => setPage(page - 1)}>Anterior</Button>
          <span className="text-sm text-muted-foreground">Página {page}</span>
          <Button variant="outline" disabled={page >= lastPage} onClick={() => setPage(page + 1)}>Próxima</Button>
        </nav>
      )}
    </section>
  )
}
