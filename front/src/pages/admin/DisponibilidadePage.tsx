import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { useQuery, useMutation } from "@tanstack/react-query"
import { useForm, FormProvider, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Check, Plus, X, CalendarIcon, Star } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

import { getDisponibilidade, updateDisponibilidade } from "@/api/admin/disponibilidade"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { DiaRow } from "@/components/disponibilidade/DiaRow"
import { cn } from "@/lib/utils"

const intervaloSchema = z.object({
  hora_inicio: z.string(),
  hora_fim: z.string(),
})

const diaSchema = z.object({
  dia: z.number().int().min(0).max(6),
  ativo: z.boolean(),
  intervalos: z.array(intervaloSchema),
})

const bloqueioSchema = z.object({
  id: z.string(),
  data: z.string().min(1),
  motivo: z.string().min(1),
})

const disponibilidadeSchema = z.object({
  intervalo_atendimento_minutos: z.number(),
  dias: z.array(diaSchema).length(7),
  bloqueios: z.array(bloqueioSchema),
})

export type DisponibilidadeFormValues = z.infer<typeof disponibilidadeSchema>

/** Linhas do formulário seg–dom; `dia` segue getDay(): 1=seg … 6=sáb, 0=dom. */
const DIA_POR_LINHA_FORM: (0 | 1 | 2 | 3 | 4 | 5 | 6)[] = [1, 2, 3, 4, 5, 6, 0]

function diasDefaultForm(): DisponibilidadeFormValues["dias"] {
  return DIA_POR_LINHA_FORM.map((dia) => ({
    dia,
    ativo: dia >= 1 && dia <= 5,
    intervalos: [{ hora_inicio: "09:00", hora_fim: "18:00" }],
  }))
}

function diasFromApi(apiDias: DisponibilidadeFormValues["dias"]): DisponibilidadeFormValues["dias"] {
  return DIA_POR_LINHA_FORM.map((dia) => {
    const found = apiDias.find((d) => d.dia === dia)
    return (
      found ?? {
        dia,
        ativo: false,
        intervalos: [],
      }
    )
  })
}

const INTERVALOS_OPTS = [
  { value: 0,  label: "Sem intervalo" },
  { value: 10, label: "10 min" },
  { value: 15, label: "15 min" },
  { value: 30, label: "30 min" },
]

function formatData(iso: string) {
  const [y, m, d] = iso.split("-")
  return `${d}/${m}/${y}`
}

export function DisponibilidadePage() {
  const { slug } = useParams<{ slug: string }>()
  const [bloqueioOpen, setBloqueioOpen] = useState(false)
  const [dataSelecionada, setDataSelecionada] = useState<Date | undefined>()
  const [motivo, setMotivo] = useState("")

  const { data, isLoading } = useQuery({
    queryKey: ["disponibilidade", slug],
    queryFn: () => getDisponibilidade(slug!),
    enabled: !!slug,
  })

  const form = useForm<DisponibilidadeFormValues>({
    resolver: zodResolver(disponibilidadeSchema),
    defaultValues: {
      intervalo_atendimento_minutos: 30,
      dias: diasDefaultForm(),
      bloqueios: [],
    },
  })

  const { fields: bloqueios, append: adicionarBloqueio, remove: removerBloqueio } = useFieldArray({
    control: form.control,
    name: "bloqueios",
  })

  useEffect(() => {
    if (data) {
      form.reset({
        intervalo_atendimento_minutos: data.intervalo_atendimento_minutos,
        dias: diasFromApi(data.dias as DisponibilidadeFormValues["dias"]),
        bloqueios: data.bloqueios,
      })
    }
  }, [data, form])

  const { mutate: salvar, isPending } = useMutation({
    mutationFn: (values: DisponibilidadeFormValues) => updateDisponibilidade(slug!, {
      ...values,
      dias: values.dias.map(d => ({ ...d, dia: d.dia as 0 | 1 | 2 | 3 | 4 | 5 | 6 }))
    }),
    onSuccess: () => toast.success("Disponibilidade salva!"),
    onError: () => toast.error("Erro ao salvar. Tente novamente."),
  })

  const intervaloAtual = form.watch("intervalo_atendimento_minutos")

  const handleAdicionarBloqueio = () => {
    if (!dataSelecionada || !motivo.trim()) return
    adicionarBloqueio({
      id: `b-${Date.now()}`,
      data: format(dataSelecionada, "yyyy-MM-dd"),
      motivo: motivo.trim(),
    })
    setDataSelecionada(undefined)
    setMotivo("")
    setBloqueioOpen(false)
  }

  const handleCloseBloqueioDialog = (open: boolean) => {
    if (!open) {
      setDataSelecionada(undefined)
      setMotivo("")
    }
    setBloqueioOpen(open)
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit((v) => salvar(v))}>
        <div className="space-y-6 max-w-5xl">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold font-playfair text-foreground">Disponibilidade</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Configure os dias, horários e bloqueios do seu atendimento.
              </p>
            </div>
            <Button type="submit" disabled={isPending || isLoading} className="rounded-full gap-2 shrink-0">
              <Check className="h-4 w-4" />
              {isPending ? "Salvando..." : "Salvar"}
            </Button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-[1fr_400px] gap-6">
              <Skeleton className="h-96 rounded-xl" />
              <div className="space-y-4">
                <Skeleton className="h-32 rounded-xl" />
                <Skeleton className="h-48 rounded-xl" />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 items-start">
              {/* Left — weekly schedule */}
              <Card className="border border-border">
                <CardHeader>
                  <CardTitle className="text-base font-semibold font-playfair">
                    Horários semanais
                  </CardTitle>
                </CardHeader>
                <CardContent >
                  {Array.from({ length: 7 }, (_, i) => (
                    <DiaRow key={i} index={i} />
                  ))}
                </CardContent>
              </Card>

              {/* Right column */}
              <div className="space-y-4">
                {/* Intervalo entre atendimentos */}
                <Card className="border border-border">
                  <CardContent>
                    <CardTitle className="text-base font-semibold font-playfair">Intervalo entre atendimentos</CardTitle>
                    <div className="pt-5 flex flex-wrap gap-2">
                      {INTERVALOS_OPTS.map(({ value, label }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => form.setValue("intervalo_atendimento_minutos", value)}
                          className={cn(
                            "px-3 py-1.5 rounded-full text-sm border transition-colors",
                            intervaloAtual === value
                              ? "bg-primary text-primary-foreground border-primary"
                              : "border-border text-foreground hover:bg-accent"
                          )}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Bloqueios */}
                <Card className="border border-border">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-base font-semibold font-playfair">Bloqueios</CardTitle>
                    <Button
                      type="button"
                      size="sm"
                      className="rounded-full gap-1.5 h-8 text-xs"
                      onClick={() => setBloqueioOpen(true)}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Bloquear data
                    </Button>
                  </CardHeader>
                  <CardContent className="pt-1">
                    {bloqueios.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-2">Nenhuma data bloqueada.</p>
                    ) : (
                      <div className="space-y-2">
                        {bloqueios.map((field, i) => (
                          <div
                            key={field.id}
                            className="flex items-center gap-3 rounded-lg border border-border p-3"
                          >
                            <CalendarIcon className="h-4 w-4 text-primary shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground">
                                {formatData(form.watch(`bloqueios.${i}.data`))}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {form.watch(`bloqueios.${i}.motivo`)}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => removerBloqueio(i)}
                              className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Dica */}
                <div className="flex gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
                  <Star className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold font-playfair text-foreground">Dica</p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Use múltiplos intervalos para configurar pausas como almoço.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </form>

      {/* Bloquear data dialog */}
      <Dialog open={bloqueioOpen} onOpenChange={handleCloseBloqueioDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-playfair">Bloquear data</DialogTitle>
            <DialogDescription>
              Adicione uma data em que você não estará disponível para atendimento.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Data</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-white",
                      !dataSelecionada && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dataSelecionada
                      ? format(dataSelecionada, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                      : "Selecione uma data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dataSelecionada}
                    onSelect={setDataSelecionada}
                    disabled={{ before: new Date() }}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Motivo</label>
              <Input
                placeholder="Ex: Folga pessoal"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                className="bg-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleCloseBloqueioDialog(false)}>
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleAdicionarBloqueio}
              disabled={!dataSelecionada || !motivo.trim()}
              className="rounded-full"
            >
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </FormProvider>
  )
}
