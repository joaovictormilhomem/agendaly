import { useState } from "react"
import { useParams } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus } from "lucide-react"
import { toast } from "sonner"

import { getServicos, createServico, updateServico, deleteServico } from "@/api/admin/servicos"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ServicoCard } from "@/components/servicos/ServicoCard"
import { ServicoFormDialog } from "@/components/servicos/ServicoFormDialog"
import type { Servico, ServicoCreate } from "@/types/servico"

export function ServicosPage() {
  const { slug } = useParams<{ slug: string }>()
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Servico | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ["servicos", slug],
    queryFn: () => getServicos(slug!),
    enabled: !!slug,
  })

  const { mutate: criar, isPending: isCriando } = useMutation({
    mutationFn: (body: ServicoCreate) => createServico(slug!, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["servicos", slug] })
      toast.success("Serviço adicionado!")
      setDialogOpen(false)
    },
    onError: () => toast.error("Erro ao adicionar serviço."),
  })

  const { mutate: editar, isPending: isEditando } = useMutation({
    mutationFn: (body: ServicoCreate) => updateServico(slug!, editing!.id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["servicos", slug] })
      toast.success("Serviço atualizado!")
      setDialogOpen(false)
      setEditing(null)
    },
    onError: () => toast.error("Erro ao atualizar serviço."),
  })

  const { mutate: excluir } = useMutation({
    mutationFn: (id: string) => deleteServico(slug!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["servicos", slug] })
      toast.success("Serviço excluído.")
    },
    onError: () => toast.error("Erro ao excluir serviço."),
  })

  const handleOpenCreate = () => {
    setEditing(null)
    setDialogOpen(true)
  }

  const handleOpenEdit = (servico: Servico) => {
    setEditing(servico)
    setDialogOpen(true)
  }

  const handleSubmit = (data: ServicoCreate) => {
    if (editing) {
      editar(data)
    } else {
      criar(data)
    }
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-playfair text-foreground">Serviços</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Gerencie os serviços disponíveis para agendamento na sua página.
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="rounded-full gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          Adicionar serviço
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : data?.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
          <p className="text-sm font-medium text-foreground mb-1">Nenhum serviço cadastrado</p>
          <p className="text-xs text-muted-foreground mb-4">Adicione seu primeiro serviço para começar a receber agendamentos.</p>
          <Button onClick={handleOpenCreate} variant="outline" className="rounded-full gap-2">
            <Plus className="h-4 w-4" />
            Adicionar serviço
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {data?.map((servico) => (
            <ServicoCard
              key={servico.id}
              servico={servico}
              onEdit={handleOpenEdit}
              onDelete={excluir}
            />
          ))}
        </div>
      )}

      <ServicoFormDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) setEditing(null)
        }}
        servico={editing}
        onSubmit={handleSubmit}
        isPending={isCriando || isEditando}
      />
    </div>
  )
}
