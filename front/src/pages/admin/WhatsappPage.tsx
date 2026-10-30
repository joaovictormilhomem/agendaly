import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { toast } from "sonner"
import { RefreshCw } from "lucide-react"

import {
  getWhatsappMensagens,
  getWhatsappStatus,
  postWhatsappConectar,
  postWhatsappDesconectar,
} from "@/api/admin/whatsapp"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import type { WhatsappMensagem, WhatsappMensagemContexto, WhatsappMensagemStatus } from "@/types/whatsapp"

const POLL_MS = 2500

const contextoLabel: Record<WhatsappMensagemContexto, string> = {
  agendamento_criado: "Pedido recebido",
  confirmado_admin: "Confirmação",
  cancelado: "Cancelamento",
}

const statusLabel: Record<WhatsappMensagemStatus, { label: string; className: string }> = {
  pendente: {
    label: "Pendente",
    className: "border-transparent text-[#92650A] bg-[#FEF3C7] hover:bg-[#FEF3C7]",
  },
  enviado: {
    label: "Enviado",
    className: "border-transparent text-[#519670] bg-[#E8F5EE] hover:bg-[#E8F5EE]",
  },
  falhou: {
    label: "Falhou",
    className: "border-transparent text-[#B91C1C] bg-[#FEE2E2] hover:bg-[#FEE2E2]",
  },
}

function formatarQuando(iso: string) {
  const data = new Date(iso)
  if (Number.isNaN(data.getTime())) return iso
  return format(data, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
}

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
  const [page, setPage] = useState(1)
  const [aberta, setAberta] = useState<WhatsappMensagem | null>(null)

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

  useEffect(() => {
    setPage(1)
  }, [slug])

  const mensagensQuery = useQuery({
    queryKey: ["whatsapp-mensagens", slug, page],
    queryFn: () => getWhatsappMensagens(slug!, page),
    enabled: Boolean(slug),
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

  const mensagens = mensagensQuery.data?.mensagens ?? []
  const lastPage = mensagensQuery.data?.meta.last_page ?? 1

  return (
    <div className="max-w-3xl space-y-8">
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

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold font-playfair text-foreground">Mensagens</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Tentativas de envio desta conta, da mais recente para a mais antiga.
          </p>
        </div>

        {mensagensQuery.isLoading && (
          <div className="space-y-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        )}

        {mensagensQuery.isError && (
          <p className="text-sm text-destructive">Não foi possível carregar as mensagens.</p>
        )}

        {!mensagensQuery.isLoading && !mensagensQuery.isError && mensagens.length === 0 && (
          <p className="text-sm text-muted-foreground">Nenhuma tentativa de mensagem ainda.</p>
        )}

        {!mensagensQuery.isLoading && !mensagensQuery.isError && mensagens.length > 0 && (
          <div className="divide-y divide-border rounded-xl border border-border bg-card">
            {mensagens.map((item) => {
              const status = statusLabel[item.status]
              return (
                <div key={item.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">
                        {item.cliente_nome || "Cliente"}
                      </p>
                      <Badge variant="outline" className={cn(status.className, "text-[10px] font-semibold")}>
                        {status.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {contextoLabel[item.contexto] ?? item.contexto} · {item.destinatario} ·{" "}
                      {formatarQuando(item.created_at)}
                    </p>
                    {item.status !== "enviado" && item.erro && (
                      <p className="text-xs text-destructive">{item.erro}</p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full text-xs h-7 shrink-0"
                    onClick={() => setAberta(item)}
                  >
                    Ver mensagem
                  </Button>
                </div>
              )
            })}
          </div>
        )}

        {!mensagensQuery.isLoading && !mensagensQuery.isError && lastPage > 1 && (
          <div className="flex items-center justify-between gap-3">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((atual) => Math.max(1, atual - 1))}
            >
              Anterior
            </Button>
            <p className="text-xs text-muted-foreground">
              Página {page} de {lastPage}
            </p>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= lastPage}
              onClick={() => setPage((atual) => atual + 1)}
            >
              Próxima
            </Button>
          </div>
        )}
      </section>

      <Dialog open={Boolean(aberta)} onOpenChange={(open) => !open && setAberta(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-playfair">{aberta?.cliente_nome || "Mensagem"}</DialogTitle>
            <DialogDescription>
              {aberta ? `${contextoLabel[aberta.contexto] ?? aberta.contexto} · ${aberta.destinatario}` : ""}
            </DialogDescription>
          </DialogHeader>
          <p className="whitespace-pre-wrap text-sm text-foreground">{aberta?.corpo}</p>
        </DialogContent>
      </Dialog>
    </div>
  )
}
