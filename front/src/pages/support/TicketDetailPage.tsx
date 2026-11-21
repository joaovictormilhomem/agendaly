import { useEffect, useState, type FormEvent } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Link, useParams } from "react-router-dom"
import { isAxiosError } from "axios"
import {
  getSupportTicket,
  markSupportTicketRead,
  replyToSupportTicket,
  ticketStatuses,
  updateSupportTicketStatus,
  type TicketStatus,
} from "@/api/support"
import { ticketDate } from "@/components/support/TicketList"
import { TicketStatusBadge } from "@/components/support/TicketStatusBadge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/hooks/useAuth"

export function TicketDetailPage({ staff = false }: { staff?: boolean }) {
  const { id } = useParams()
  return <TicketDetail key={id} id={id ?? ""} staff={staff} />
}

function TicketDetail({ id, staff }: { id: string; staff: boolean }) {
  const { slug } = useParams()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [body, setBody] = useState("")
  const ticket = useQuery({
    queryKey: ["support", user?.id, "detail", id],
    queryFn: () => getSupportTicket(id),
    retry: (count, error) => (!isAxiosError(error) || error.response?.status !== 404) && count < 1,
  })
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["support", user?.id] })
  const reply = useMutation({
    mutationFn: (message: string) => replyToSupportTicket(id, message),
    onSuccess: async () => {
      setBody("")
      await refresh()
    },
  })
  const status = useMutation({
    mutationFn: (value: TicketStatus) => updateSupportTicketStatus(id, value),
    onSuccess: refresh,
  })
  const { mutate: markRead } = useMutation({
    mutationFn: (replyId: string) => markSupportTicketRead(id, replyId),
    onSuccess: refresh,
    retry: 1,
  })
  const unreadReplyId = ticket.data?.unread_reply_id
  useEffect(() => {
    if (!staff && unreadReplyId) markRead(unreadReplyId)
  }, [staff, unreadReplyId, markRead])

  function submitReply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const message = body.trim()
    if (message && !reply.isPending && !status.isPending) reply.mutate(message)
  }

  const data = ticket.data
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Button variant="outline" asChild>
        <Link to={staff ? "/master/suporte" : `/admin/${slug}/ajuda`}>Voltar aos chamados</Link>
      </Button>
      {ticket.isPending && <p role="status" className="text-sm text-muted-foreground">Carregando chamado…</p>}
      {ticket.isError && <p role="alert" className="text-sm text-destructive">
        {isAxiosError(ticket.error) && ticket.error.response?.status === 404
          ? "Chamado não encontrado."
          : "Não foi possível carregar o chamado."}
      </p>}
      {data && (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="break-all font-playfair text-3xl font-bold">{data.subject}</h1>
            <TicketStatusBadge status={data.status} />
          </div>
          {staff && (
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Label htmlFor="support-ticket-status">Status do chamado</Label>
                <Select
                  value={status.isPending ? status.variables : data.status}
                  disabled={status.isPending || reply.isPending}
                  onValueChange={(value) => status.mutate(value as TicketStatus)}
                >
                  <SelectTrigger id="support-ticket-status" size="sm" className="w-44 max-w-full bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {(Object.keys(ticketStatuses) as TicketStatus[]).map((value) => (
                      <SelectItem key={value} value={value} textValue={ticketStatuses[value]}>
                        <TicketStatusBadge status={value} />
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {status.isError && <p role="alert" className="text-sm text-destructive">Não foi possível alterar o status.</p>}
            </div>
          )}
          <section aria-label="Histórico do chamado" className="space-y-3">
            <TicketMessage author={staff ? `${data.requester_name} · ${data.requester_email}` : "Você"} date={data.created_at} body={data.description} />
            {data.replies.map((message) => (
              <TicketMessage
                key={message.id}
                author={message.author === "SUPPORT" ? "Equipe de suporte" : staff ? data.requester_name : "Você"}
                date={message.created_at}
                body={message.body}
              />
            ))}
          </section>
          <form onSubmit={submitReply} className="space-y-3">
            <Label htmlFor="ticket-reply">Sua resposta</Label>
            <Textarea
              id="ticket-reply"
              className="bg-white"
              value={body}
              onChange={(event) => setBody(event.target.value)}
              rows={4}
              maxLength={4000}
              disabled={reply.isPending}
            />
            {!staff && data.status === "RESOLVED" && <p className="text-sm text-muted-foreground">Ao enviar uma resposta, o chamado será reaberto.</p>}
            {reply.isError && <p role="alert" className="text-sm text-destructive">Não foi possível enviar a resposta. Tente novamente.</p>}
            <Button type="submit" disabled={!body.trim() || reply.isPending || status.isPending}>
              {reply.isPending ? "Enviando…" : "Enviar resposta"}
            </Button>
          </form>
        </>
      )}
    </div>
  )
}

function TicketMessage({ author, date, body }: { author: string; date: string; body: string }) {
  return (
    <Card className="gap-2 py-4">
      <CardHeader className="flex flex-wrap items-center justify-between gap-2">
        <p className="break-all text-sm font-semibold">{author}</p>
        <time className="text-sm text-muted-foreground" dateTime={date}>{ticketDate.format(new Date(date))}</time>
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-wrap break-words text-sm">{body}</p>
      </CardContent>
    </Card>
  )
}
