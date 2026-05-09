import { useEffect, useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EmojiPicker } from "@/components/servicos/EmojiPicker"
import type { Servico, ServicoCreate } from "@/types/servico"

const servicoSchema = z.object({
  emoji: z.string().min(1, "Obrigatório").max(4, "Muito longo"),
  nome: z.string().min(1, "Nome é obrigatório"),
  descricao: z.string().optional().default(""),
  duracao_minutos: z.coerce.number().int().positive(),
  preco: z.coerce.number().positive("Informe um valor válido"),
  ativo: z.boolean().default(true),
})

type FormValues = z.infer<typeof servicoSchema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  servico?: Servico | null
  onSubmit: (data: ServicoCreate) => void
  isPending?: boolean
}

const DURACOES = [
  { value: 30, label: "30 min" },
  { value: 45, label: "45 min" },
  { value: 60, label: "1 hora" },
  { value: 90, label: "1h 30min" },
  { value: 120, label: "2 horas" },
]

export function ServicoFormDialog({ open, onOpenChange, servico, onSubmit, isPending }: Props) {
  const [isEdit, setIsEdit] = useState(!!servico)
  const form = useForm<FormValues>({
    resolver: zodResolver(servicoSchema),
    defaultValues: {
      emoji: "",
      nome: "",
      descricao: "",
      duracao_minutos: 60,
      preco: 0,
      ativo: true,
    },
  })

  useEffect(() => {
    if (open) {
      setIsEdit(!!servico)
      form.reset(
        servico
          ? {
              emoji: servico.emoji,
              nome: servico.nome,
              descricao: servico.descricao ?? "",
              duracao_minutos: servico.duracao_minutos,
              preco: servico.preco,
              ativo: servico.ativo,
            }
          : { emoji: "", nome: "", descricao: "", duracao_minutos: 60, preco: 0, ativo: true }
      )
    }
  }, [open, servico, form])

  const handleSubmit = (values: FormValues) => {
    onSubmit({
      emoji: values.emoji,
      nome: values.nome,
      descricao: values.descricao ?? "",
      duracao_minutos: values.duracao_minutos,
      preco: values.preco,
      ativo: values.ativo,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar serviço" : "Novo serviço"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Atualize as informações do serviço." : "Preencha os dados para adicionar um novo serviço."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-[72px_1fr] gap-3">
              <FormField
                control={form.control}
                name="emoji"
                render={({ field }) => (
                  <FormItem >
                    <FormLabel>Ícone</FormLabel>
                    <FormControl>
                      <EmojiPicker value={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do serviço</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Alongamento em Gel" {...field} className="bg-white"/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição <span className="text-muted-foreground font-normal">(opcional)</span></FormLabel>
                  <FormControl>
                    <Textarea placeholder="Descreva o serviço brevemente..." rows={2} {...field} className="bg-white"/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="duracao_minutos"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duração</FormLabel>
                    <Select
                      value={String(field.value)}
                      onValueChange={(v) => field.onChange(Number(v))}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {DURACOES.map((d) => (
                          <SelectItem key={d.value} value={String(d.value)} className="bg-white">
                            {d.label}
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
                name="preco"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço (R$)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} step={0.01} placeholder="0,00" {...field} className="bg-white"/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Controller
              control={form.control}
              name="ativo"
              render={({ field }) => (
                <div className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div>
                    <p className="text-sm font-medium">Serviço ativo</p>
                    <p className="text-xs text-muted-foreground">Aparece na sua página pública para agendamento</p>
                  </div>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </div>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-full">
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending} className="rounded-full">
                {isPending ? "Salvando..." : isEdit ? "Salvar alterações" : "Adicionar serviço"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
