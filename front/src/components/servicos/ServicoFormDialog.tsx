import { useEffect, useState } from "react"
import { useForm, Controller, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Plus, Trash2 } from "lucide-react"
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
import { EmojiPicker } from "@/components/servicos/EmojiPicker"
import type { Servico, ServicoCreate } from "@/types/servico"

const incrementoSchema = z.object({
  id: z.string().optional(),
  nome: z.string().min(1, "Nome é obrigatório"),
  duracao_minutos: z.coerce
    .number()
    .int()
    .min(15, "Mínimo 15 minutos")
    .refine((value) => value % 15 === 0, "Use intervalos de 15 minutos"),
  preco: z.coerce.number().min(0, "Informe um valor válido"),
  obrigatorio: z.boolean(),
})

const servicoSchema = z.object({
  emoji: z.string().min(1, "Obrigatório").max(4, "Muito longo"),
  nome: z.string().min(1, "Nome é obrigatório"),
  descricao: z.string().optional().default(""),
  duracao_minutos: z.coerce
    .number()
    .int()
    .min(15, "A duração mínima é de 15 minutos")
    .refine((value) => value % 15 === 0, "Use intervalos de 15 minutos"),
  preco: z.coerce.number().positive("Informe um valor válido"),
  ativo: z.boolean().default(true),
  incrementos: z.array(incrementoSchema).default([]),
})

type FormValues = z.infer<typeof servicoSchema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  servico?: Servico | null
  onSubmit: (data: ServicoCreate) => void
  isPending?: boolean
}

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
      incrementos: [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "incrementos",
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
              duracao_minutos: servico.duracao_base_minutos ?? servico.duracao_minutos,
              preco: servico.preco_base ?? servico.preco,
              ativo: servico.ativo,
              incrementos: (servico.incrementos ?? []).map((i) => ({
                id: i.id,
                nome: i.nome,
                duracao_minutos: i.duracao_minutos,
                preco: i.preco,
                obrigatorio: i.obrigatorio,
              })),
            }
          : {
              emoji: "",
              nome: "",
              descricao: "",
              duracao_minutos: 60,
              preco: 0,
              ativo: true,
              incrementos: [],
            }
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
      incrementos: values.incrementos.map((i, idx) => ({
        id: i.id,
        nome: i.nome,
        duracao_minutos: i.duracao_minutos,
        preco: i.preco,
        obrigatorio: i.obrigatorio,
        ordem: idx,
      })),
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
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
                  <FormItem>
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
                      <Input placeholder="Ex: Alongamento em Gel" {...field} className="bg-white" />
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
                  <FormLabel>
                    Descrição <span className="text-muted-foreground font-normal">(opcional)</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva o serviço brevemente..."
                      rows={2}
                      {...field}
                      className="bg-white"
                    />
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
                    <FormLabel>Duração base (min)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={15}
                        step={15}
                        inputMode="numeric"
                        placeholder="Ex: 75"
                        {...field}
                        className="bg-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="preco"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço base (R$)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step={0.01}
                        placeholder="0,00"
                        {...field}
                        className="bg-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <p className="text-xs text-muted-foreground -mt-2">
              Com especificações (ex.: mãos, pés), o valor e a duração do agendamento vêm delas — o
              base só vale quando não há especificações.
            </p>

            <div className="space-y-3 rounded-lg border border-border p-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-medium">Especificações</p>
                  <p className="text-xs text-muted-foreground">
                    Opções do serviço com preço e duração próprios (ex.: Mãos, Pés).
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-full shrink-0 gap-1"
                  onClick={() =>
                    append({
                      nome: "",
                      duracao_minutos: 30,
                      preco: 0,
                      obrigatorio: false,
                    })
                  }
                >
                  <Plus className="h-3.5 w-3.5" />
                  Adicionar
                </Button>
              </div>

              {fields.length === 0 ? (
                <p className="text-xs text-muted-foreground py-2">Nenhuma especificação cadastrada.</p>
              ) : (
                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="rounded-md border border-border bg-muted/30 p-3 space-y-3"
                    >
                      <div className="flex items-start gap-2">
                        <FormField
                          control={form.control}
                          name={`incrementos.${index}.nome`}
                          render={({ field: f }) => (
                            <FormItem className="flex-1">
                              <FormLabel>Nome</FormLabel>
                              <FormControl>
                                <Input placeholder="Ex: Mãos" {...f} className="bg-white" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="mt-7 text-muted-foreground hover:text-destructive h-8 w-8 p-0"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <FormField
                          control={form.control}
                          name={`incrementos.${index}.duracao_minutos`}
                          render={({ field: f }) => (
                            <FormItem>
                              <FormLabel>Duração (min)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min={15}
                                  step={15}
                                  {...f}
                                  className="bg-white"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`incrementos.${index}.preco`}
                          render={({ field: f }) => (
                            <FormItem>
                              <FormLabel>Preço (R$)</FormLabel>
                              <FormControl>
                                <Input type="number" min={0} step={0.01} {...f} className="bg-white" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <Controller
                        control={form.control}
                        name={`incrementos.${index}.obrigatorio`}
                        render={({ field: f }) => (
                          <div className="flex items-center justify-between rounded-md border border-border bg-white px-3 py-2">
                            <div>
                              <p className="text-sm font-medium">Obrigatório</p>
                              <p className="text-xs text-muted-foreground">
                                Sempre incluído no agendamento
                              </p>
                            </div>
                            <Switch checked={f.value} onCheckedChange={f.onChange} />
                          </div>
                        )}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Controller
              control={form.control}
              name="ativo"
              render={({ field }) => (
                <div className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div>
                    <p className="text-sm font-medium">Serviço ativo</p>
                    <p className="text-xs text-muted-foreground">
                      Aparece na sua página pública para agendamento
                    </p>
                  </div>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </div>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="rounded-full"
              >
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
