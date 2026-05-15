import { AlertTriangle } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"

export function ImpersonationBanner() {
  const { impersonating, stopImpersonation } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  if (!impersonating) return null

  function handleStop() {
    stopImpersonation()
    queryClient.clear()
    navigate("/master/dashboard")
  }

  return (
    <div className="flex items-center justify-between bg-amber-50 border-b border-amber-200 px-6 py-2 text-sm text-amber-800">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 shrink-0" />
        <span>
          Você está visualizando o painel de{" "}
          <strong>{impersonating.target.nome}</strong> como administrador.
        </span>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={handleStop}
        className="border-amber-400 text-amber-800 hover:bg-amber-100"
      >
        Voltar ao Master
      </Button>
    </div>
  )
}
