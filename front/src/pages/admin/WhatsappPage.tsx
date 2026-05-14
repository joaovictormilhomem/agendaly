import { useParams } from "react-router-dom"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { RefreshCw } from "lucide-react"

import {
  getWhatsappStatus,
  postWhatsappConectar,
  postWhatsappDesconectar,
} from "@/api/admin/whatsapp"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

const POLL_MS = 2500

function labelEstado(state: string): string {
  switch (state) {
    case "ready":
      return "Conectado"
    case "qr":
      return "Aguardando leitura do QR Code"
    case "starting":
    case "authenticating":
      return "Conectando…"
    case "disconnected":
      return "Desconectado"
    case "disabled":
      return "Indisponível no servidor"
    case "error":
      return "Erro na sessão"
    default:
      return state
  }
}

export function WhatsappPage() {
  const { slug } = useParams<{ slug: string }>()
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ["whatsapp-status", slug],
    queryFn: () => getWhatsappStatus(slug!),
    enabled: Boolean(slug),
    refetchInterval: (q) => {
      const s = q.state.data?.state
      if (s === "qr" || s === "starting" || s === "authenticating") return POLL_MS
      return false
    },
  })

  const conectar = useMutation({
    mutationFn: () => postWhatsappConectar(slug!),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["whatsapp-status", slug] })
      toast.success("Sessão iniciada. Escaneie o QR Code com o WhatsApp do celular.")
    },
    onError: () => {
      toast.error("Não foi possível iniciar a conexão.")
    },
  })

  const desconectar = useMutation({
    mutationFn: () => postWhatsappDesconectar(slug!),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["whatsapp-status", slug] })
      toast.success("WhatsApp desconectado neste painel.")
    },
    onError: () => {
      toast.error("Não foi possível desconectar.")
    },
  })

  if (!slug) return null

  return (
    <div className="max-w-xl space-y-6">
      <p className="text-muted-foreground text-sm">
        Conecte o WhatsApp da profissional para enviar confirmações e avisos de cancelamento aos
        clientes automaticamente.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Conexão</CardTitle>
          <CardDescription>
            O número que escanear o QR Code será o remetente das mensagens. Use o app WhatsApp no
            celular: Menu → Aparelhos conectados → Conectar um aparelho.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading || !data ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <>
              {!data.habilitado_no_servidor && (
                <p className="text-sm text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/40 rounded-lg px-3 py-2">
                  A integração não está configurada no servidor (variáveis{" "}
                  <code className="text-xs">WHATSAPP_BRIDGE_URL</code> e{" "}
                  <code className="text-xs">WHATSAPP_BRIDGE_SECRET</code>). Peça para quem hospeda a
                  API ativar o serviço <code className="text-xs">whatsapp-worker</code>.
                </p>
              )}

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium">Status:</span>
                <span className="text-sm text-muted-foreground">{labelEstado(data.state)}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  aria-label="Atualizar status"
                  onClick={() => void queryClient.invalidateQueries({ queryKey: ["whatsapp-status", slug] })}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>

              {data.error && data.state === "error" && (
                <p className="text-sm text-destructive">Detalhe: {data.error}</p>
              )}

              {data.qr_data_url && (
                <div className="flex flex-col items-center gap-2 rounded-lg border bg-muted/30 p-4">
                  <p className="text-sm text-center text-muted-foreground">
                    Abra o WhatsApp no telefone e escaneie o código.
                  </p>
                  <img
                    src={data.qr_data_url}
                    alt="QR Code para conectar o WhatsApp"
                    className="max-w-[260px] w-full h-auto rounded-md bg-white p-2"
                  />
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-2">
                <Button
                  type="button"
                  disabled={!data.habilitado_no_servidor || conectar.isPending || data.state === "ready"}
                  onClick={() => conectar.mutate()}
                >
                  {data.state === "qr" || data.state === "starting" ? "Reiniciar sessão" : "Gerar QR Code"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={!data.habilitado_no_servidor || desconectar.isPending || data.state === "disconnected" || data.state === "disabled"}
                  onClick={() => desconectar.mutate()}
                >
                  Desconectar
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
