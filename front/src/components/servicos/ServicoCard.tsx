import { Clock, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"
import type { Servico } from "@/types/servico"

interface Props {
  servico: Servico
  onEdit: (servico: Servico) => void
  onDelete: (id: string) => void
}

function formatDuracao(min: number) {
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m > 0 ? `${h}h ${m}min` : `${h}h`
}

function formatPreco(preco: number) {
  return preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

export function ServicoCard({ servico, onEdit, onDelete }: Props) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-card px-5 py-4">
      <span className="text-2xl shrink-0 leading-none">{servico.emoji}</span>

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-foreground text-sm">{servico.nome}</p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className="text-sm font-semibold text-primary">{formatPreco(servico.preco)}</span>
          <span className="inline-flex items-center gap-1 text-xs bg-muted text-muted-foreground rounded-full px-2 py-0.5">
            <Clock className="h-3 w-3" />
            {formatDuracao(servico.duracao_minutos)}
          </span>
          <span
            className={cn(
              "text-xs rounded-full px-2 py-0.5",
              servico.ativo
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : "bg-muted text-muted-foreground"
            )}
          >
            {servico.ativo ? "Ativo" : "Inativo"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Button
          variant="outline"
          size="sm"
          className="rounded-full px-5 bg-white"
          onClick={() => onEdit(servico)}
        >
          Editar
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive h-8 w-8 p-0">
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir serviço</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir <strong>{servico.nome}</strong>? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => onDelete(servico.id)}
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
