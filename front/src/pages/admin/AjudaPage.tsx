import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Check, ExternalLink, Send } from "lucide-react"
import { createSupportTicket, type TicketInput } from "@/api/support"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { TicketList } from "@/components/support/TicketList"
import { useAuth } from "@/hooks/useAuth"

const tutorials = [
  { id: "OSbA_Roae7o", title: "Configurar sua página" },
  { id: "UyEmD2Tyy5k", title: "Conectar o WhatsApp" },
  { id: "q4Kl8DcXCaI", title: "Agendar e confirmar" },
]

const ticketSchema = z.object({
  subject: z.string().trim().min(3, "Informe um assunto com pelo menos 3 caracteres.").max(120),
  description: z.string().trim().min(10, "Descreva o problema com pelo menos 10 caracteres.").max(4000),
})

export function AjudaPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { register, handleSubmit, reset, formState: { errors } } = useForm<TicketInput>({
    resolver: zodResolver(ticketSchema),
  })
  const ticket = useMutation({
    mutationFn: createSupportTicket,
    onSuccess: () => {
      reset()
      void queryClient.invalidateQueries({ queryKey: ["support", user?.id, "list"] })
    },
  })

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <section aria-labelledby="tutoriais" className="space-y-4">
        <h1 id="tutoriais" className="font-playfair text-3xl font-bold">Tutoriais do Agendaly</h1>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {tutorials.map(({ id, title }) => (
            <Card key={id} className="gap-3 overflow-hidden py-0">
              <iframe
                className="aspect-video w-full bg-muted"
                src={`https://www.youtube-nocookie.com/embed/${id}`}
                title={title}
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
              <CardContent className="space-y-2 pb-4">
                <h2 className="font-semibold">{title}</h2>
                <a
                  href={`https://www.youtube.com/watch?v=${id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Assistir a “${title}” no YouTube (nova aba)`}
                  className="inline-flex items-center gap-1.5 text-sm text-primary underline-offset-4 hover:underline"
                >
                  Assistir no YouTube <ExternalLink className="size-3.5" />
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {ticket.isSuccess ? (
        <Card className="max-w-2xl">
          <CardContent className="space-y-4 text-center">
            <div role="status" className="space-y-3">
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10">
                <Check className="size-7 text-primary" aria-hidden="true" strokeWidth={3} />
              </div>
              <h2 className="font-playfair text-xl font-bold">Chamado enviado com sucesso!</h2>
              <p className="text-sm text-muted-foreground">A equipe de suporte recebeu seu chamado.</p>
            </div>
            <Button variant="outline" onClick={() => ticket.reset()}>Abrir outro chamado</Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle className="font-playfair text-xl">Relatar um problema</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit((values) => ticket.mutate(values))} className="space-y-4">
              <fieldset disabled={ticket.isPending} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="ticket-subject">Assunto</Label>
                  <Input
                    id="ticket-subject"
                    maxLength={120}
                    aria-invalid={!!errors.subject}
                    aria-describedby={errors.subject ? "ticket-subject-error" : undefined}
                    {...register("subject")}
                  />
                  {errors.subject && <p id="ticket-subject-error" className="text-sm text-destructive">{errors.subject.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ticket-description">Descrição do problema</Label>
                  <Textarea
                    id="ticket-description"
                    className="bg-white"
                    rows={5}
                    maxLength={4000}
                    placeholder="Em qual tela aconteceu? O que você estava tentando fazer?"
                    aria-invalid={!!errors.description}
                    aria-describedby={errors.description ? "ticket-description-error" : undefined}
                    {...register("description")}
                  />
                  {errors.description && <p id="ticket-description-error" className="text-sm text-destructive">{errors.description.message}</p>}
                </div>
                <Button type="submit"><Send className="size-4" />{ticket.isPending ? "Enviando…" : "Enviar chamado"}</Button>
              </fieldset>
              {ticket.isError && <p role="alert" className="text-sm text-destructive">Não foi possível enviar o chamado. Tente novamente.</p>}
            </form>
          </CardContent>
        </Card>
      )}
      <TicketList />
    </div>
  )
}
