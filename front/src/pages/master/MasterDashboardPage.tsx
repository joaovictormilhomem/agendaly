import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Plus, Search, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { listProfissionais, createProfissional, impersonateProfissional } from "@/api/master/profissionais"
import { useAuth } from "@/hooks/useAuth"
import type { CreateProfissionalRequest, Profissional } from "@/types/profissional"

const createSchema = z.object({
  nome: z.string().min(2, "Nome obrigatório"),
  email: z.string().email("E-mail inválido"),
  slug: z
    .string()
    .min(2, "Slug obrigatório")
    .regex(/^[a-z0-9-]+$/, "Apenas letras minúsculas, números e hífens"),
  senha: z
    .string()
    .min(8, "Mínimo 8 caracteres")
    .regex(/[A-Z]/, "Pelo menos uma maiúscula")
    .regex(/[0-9]/, "Pelo menos um número"),
  whatsapp_contato: z.string().min(8, "WhatsApp obrigatório"),
})
type CreateFormValues = z.infer<typeof createSchema>

function slugify(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR")
}

export function MasterDashboardPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { startImpersonation } = useAuth()
  const [search, setSearch] = useState("")
  const [open, setOpen] = useState(false)

  const { data: profissionais, isLoading } = useQuery({
    queryKey: ["master-profissionais"],
    queryFn: listProfissionais,
  })

  const createMutation = useMutation({
    mutationFn: (data: CreateProfissionalRequest) => createProfissional(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["master-profissionais"] })
      setOpen(false)
      reset()
    },
  })

  const impersonateMutation = useMutation({
    mutationFn: (profissional: Profissional) => impersonateProfissional(profissional.slug),
    onSuccess: ({ token }, profissional) => {
      startImpersonation(profissional, token)
      navigate(`/admin/${profissional.slug}/dashboard`)
    },
  })

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateFormValues>({ resolver: zodResolver(createSchema) })

  function onNomeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setValue("nome", val)
    setValue("slug", slugify(val))
  }

  function onSubmit(data: CreateFormValues) {
    createMutation.mutate(data)
  }

  const filtered = (profissionais ?? []).filter(
    (p) =>
      p.nome.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold text-foreground font-playfair">Master Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Gerencie todos os tenants da plataforma</p>
      </div>

      {/* Actions bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Buscar por nome ou e-mail…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white"
          />
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 shrink-0">
              <Plus className="h-4 w-4" />
              Nova Profissional
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-playfair">Nova Profissional</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
              <div className="space-y-1.5">
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  placeholder="Nome do negócio / profissional"
                  aria-invalid={!!errors.nome}
                  {...register("nome")}
                  onChange={onNomeChange}
                  className="bg-white"
                />
                {errors.nome && <p className="text-xs text-destructive">{errors.nome.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" placeholder="email@exemplo.com" aria-invalid={!!errors.email} {...register("email")} className="bg-white"/>
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="slug">
                  Slug{" "}
                  <span className="text-muted-foreground font-normal text-xs">
                    (imutável após criação)
                  </span>
                </Label>
                <div className="flex items-center border border-input rounded-md overflow-hidden">
                  <span className="px-3 py-2 bg-muted text-muted-foreground text-sm border-r border-input shrink-0">
                    agendaly.app/
                  </span>
                  <Input
                    id="slug"
                    placeholder="nome-do-negocio"
                    className="border-0 rounded-none focus-visible:ring-0 bg-white"
                    aria-invalid={!!errors.slug}
                    {...register("slug")}
                  />
                </div>
                {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="senha">Senha temporária</Label>
                <Input id="senha" type="password" placeholder="Mín. 8 chars, 1 maiúscula, 1 número" aria-invalid={!!errors.senha} {...register("senha")} className="bg-white"/>
                {errors.senha && <p className="text-xs text-destructive">{errors.senha.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="whatsapp_contato">WhatsApp</Label>
                <Input id="whatsapp_contato" placeholder="(63) 99999-9999" aria-invalid={!!errors.whatsapp_contato} {...register("whatsapp_contato")} className="bg-white"/>
                {errors.whatsapp_contato && (
                  <p className="text-xs text-destructive">{errors.whatsapp_contato.message}</p>
                )}
              </div>

              {createMutation.error && (
                <p className="text-xs text-destructive">
                  {(createMutation.error as Error).message ?? "Erro ao criar profissional"}
                </p>
              )}

              <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Criando…" : "Criar profissional"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border overflow-hidden bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead>Nome</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead className="w-[120px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 5 }).map((__, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground text-sm">
                  {search ? "Nenhuma profissional encontrada." : "Nenhuma profissional cadastrada ainda."}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.nome}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{p.email}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-mono text-xs">
                      {p.slug}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{formatDate(p.created_at)}</TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 text-xs"
                      disabled={impersonateMutation.isPending}
                      onClick={() => impersonateMutation.mutate(p)}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Acessar Painel
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
