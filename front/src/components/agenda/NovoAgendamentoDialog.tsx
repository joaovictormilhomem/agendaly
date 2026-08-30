import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Textarea } from "@/components/ui/textarea"
import { getServicos } from "@/api/admin/servicos"
import { createAgendamentoManual, getAdminSlots } from "@/api/admin/agenda"
import { combineDateAndTimeToIso } from "@/lib/datetime"
import { cn } from "@/lib/utils"
import { idsObrigatorios, totaisServico } from "@/types/servico"

const schema = z.object({
  cliente_nome: z.string().min(1, "Nome é obrigatório"),
  cliente_email: z.union([z.literal(""), z.string().email("E-mail inválido")]),
  cliente_whatsapp: z.string().min(1, "Telefone é obrigatório"),
  servicoId: z.string().min(1, "Selecione um serviço"),
  notas_internas: z.string().max(5000, "Máximo de 5000 caracteres"),
})

type FormValues = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  slug: string
  initialDate?: Date
}

function formatWhatsapp(value: string): string {
  const cleaned = value.replace(/\D/g, "").slice(0, 11)
  if (cleaned.length <= 2) return cleaned ? `(${cleaned}` : ""
  if (cleaned.length <= 7) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`
  return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`
}

export function NovoAgendamentoDialog({ open, onOpenChange, slug, initialDate }: Props) {
  const qc = useQueryClient()
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate ?? new Date())
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [incrementoIds, setIncrementoIds] = useState<string[]>([])

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      cliente_nome: "",
      cliente_email: "",
      cliente_whatsapp: "",
      servicoId: "",
      notas_internas: "",
    },
  })

  const servicoId = form.watch("servicoId")

  const { data: servicos = [] } = useQuery({
    queryKey: ["servicos", slug],
    queryFn: () => getServicos(slug),
    enabled: open,
  })

  const servicoSelecionado = servicos.find((s) => s.id === servicoId)
  const temIncrementos = (servicoSelecionado?.incrementos?.length ?? 0) > 0
  const incrementosOk =
    !temIncrementos ||
    (servicoSelecionado
      ? totaisServico(servicoSelecionado, incrementoIds).incrementos.length > 0
      : false)

  const { data: slots = [] } = useQuery({
    queryKey: [
      "admin-slots",
      slug,
      format(selectedDate, "yyyy-MM-dd"),
      servicoId,
      [...incrementoIds].sort().join(","),
    ],
    queryFn: () => getAdminSlots(slug, selectedDate, servicoId, incrementoIds),
    enabled: open && !!servicoId && incrementosOk,
  })

  const { mutate, isPending } = useMutation({
    mutationFn: (values: FormValues) => {
      if (!selectedSlot) throw new Error("Selecione um horário")
      return createAgendamentoManual(slug, {
        cliente_nome: values.cliente_nome,
        cliente_email: values.cliente_email.trim() || undefined,
        cliente_whatsapp: values.cliente_whatsapp.replace(/\D/g, "").slice(0, 20),
        servicoId: values.servicoId,
        incremento_ids: incrementoIds.length > 0 ? incrementoIds : undefined,
        data_hora_inicio: combineDateAndTimeToIso(selectedDate, selectedSlot),
        notas_internas: values.notas_internas.trim() || undefined,
      })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["agenda", slug] })
      qc.invalidateQueries({ queryKey: ["dashboard", slug] })
      onOpenChange(false)
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        cliente_nome: "",
        cliente_email: "",
        cliente_whatsapp: "",
        servicoId: "",
        notas_internas: "",
      })
      setSelectedDate(initialDate ?? new Date())
      setSelectedSlot(null)
      setIncrementoIds([])
    }
  }, [open, initialDate, form])

  useEffect(() => {
    setSelectedSlot(null)
  }, [selectedDate, servicoId, incrementoIds])

  useEffect(() => {
    if (!servicoSelecionado) {
      setIncrementoIds([])
      return
    }
    setIncrementoIds(idsObrigatorios(servicoSelecionado))
  }, [servicoId])

  const handleSubmit = (values: FormValues) => {
    if (temIncrementos && !incrementosOk) {
      form.setError("root", { message: "Selecione ao menos uma especificação do serviço" })
      return
    }
    if (!selectedSlot) {
      form.setError("root", { message: "Selecione um horário" })
      return
    }
    mutate(values)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="font-playfair">Novo agendamento</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="cliente_nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="data-[error=true]:text-foreground">Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do cliente" {...field} className="bg-white" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cliente_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="data-[error=true]:text-foreground">Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="exemplo@email.com" {...field} className="bg-white" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="servicoId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="data-[error=true]:text-foreground">Serviço</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="Selecione um serviço" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {servicos.filter((s) => s.ativo).map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.emoji} {s.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cliente_whatsapp"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="data-[error=true]:text-foreground">Telefone</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="(63) 99999-9999"
                        value={field.value}
                        onChange={(e) => field.onChange(formatWhatsapp(e.target.value))}
                        className={cn("bg-white", fieldState.error && "border-destructive")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {servicoSelecionado && temIncrementos && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Especificações</p>
                <div className="space-y-1.5">
                  {servicoSelecionado.incrementos.map((inc) => {
                    const checked = incrementoIds.includes(inc.id) || inc.obrigatorio
                    return (
                      <button
                        key={inc.id}
                        type="button"
                        disabled={inc.obrigatorio}
                        onClick={() => {
                          if (inc.obrigatorio) return
                          setIncrementoIds((prev) =>
                            prev.includes(inc.id)
                              ? prev.filter((x) => x !== inc.id)
                              : [...prev, inc.id]
                          )
                        }}
                        className={cn(
                          "w-full flex items-center justify-between rounded-md border px-3 py-2 text-left text-sm transition-colors",
                          checked
                            ? "border-primary bg-primary/5"
                            : "border-border hover:bg-accent"
                        )}
                      >
                        <span>
                          {inc.nome}
                          {inc.obrigatorio ? " (obrigatório)" : ""}
                          <span className="text-muted-foreground">
                            {" "}
                            · {inc.duracao_minutos} min ·{" "}
                            {inc.preco.toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })}
                          </span>
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Date / Hora */}
            <div>
              <p className="text-sm font-medium mb-2">Data / Hora</p>
              <div className="grid rounded-lg border border-border overflow-hidden" style={{ gridTemplateColumns: "auto 1fr" }}>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(d) => d && setSelectedDate(d)}
                  locale={ptBR}
                  disabled={{ before: new Date() }}
                  className="bg-white"
                />
                <div className="border-l border-border bg-white h-[332px] flex flex-col">
                  <ScrollArea className="h-full">
                    {!servicoId ? (
                      <p className="text-xs text-muted-foreground text-center py-6 px-3">
                        Selecione um serviço para ver horários disponíveis
                      </p>
                    ) : !incrementosOk ? (
                      <p className="text-xs text-muted-foreground text-center py-6 px-3">
                        Selecione as especificações do serviço
                      </p>
                    ) : slots.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-6 px-3">
                        Sem horários disponíveis neste dia
                      </p>
                    ) : (
                      <div className="flex flex-col gap-1 p-2">
                        {slots.map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setSelectedSlot(slot)}
                            className={cn(
                              "w-full rounded-md py-1.5 text-sm font-medium transition-colors",
                              selectedSlot === slot
                                ? "bg-primary text-primary-foreground"
                                : "border border-border hover:bg-accent text-foreground"
                            )}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </div>
              </div>
              {form.formState.errors.root && (
                <p className="text-sm text-destructive mt-1">{form.formState.errors.root.message}</p>
              )}
            </div>

            <FormField
              control={form.control}
              name="notas_internas"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="data-[error=true]:text-foreground">
                    Notas internas <span className="font-normal text-muted-foreground">(opcional)</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Motivo do agendamento manual, observações para a equipe…"
                      className="bg-white min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-full">
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending} className="rounded-full">
                {isPending ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
