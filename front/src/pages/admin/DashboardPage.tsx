import { useQuery } from "@tanstack/react-query"
import { useParams, useNavigate } from "react-router-dom"
import { Clock, Scissors, Settings, ChevronRight, X, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { getDashboard } from "@/api/admin/agenda"
import { getPerfil } from "@/api/admin/perfil"
import { useAuth } from "@/hooks/useAuth"
import { StatusChip } from "@/components/shared/StatusChip"
import { cn } from "@/lib/utils"
import type { Agendamento } from "@/types/agenda"
import { useState } from "react"

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return "Bom dia"
  if (h < 18) return "Boa tarde"
  return "Boa noite"
}

function formatDate() {
  return new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
}

function minutesUntil(iso: string) {
  return Math.max(0, Math.round((new Date(iso).getTime() - Date.now()) / 60000))
}

interface StatCardProps {
  label: string
  sublabel: string
  value: string | number
  color: string
}

function StatCard({ label, sublabel, value, color }: StatCardProps) {
  return (
    <Card className="border border-border">
      <CardContent>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{label}</p>
        <p className={cn("text-4xl font-bold font-playfair", color)}>{value}</p>
        <p className="text-xs font-semibold text-muted-foreground mt-1">{sublabel}</p>
      </CardContent>
    </Card>
  )
}

function AgendamentoRow({ item }: { item: Agendamento }) {
  return (
    <div className="flex items-center gap-3 py-4 border-t border-border">
      <Avatar className="h-10 w-10 shrink-0">
        <AvatarFallback className="bg-secondary text-primary text-md font-semibold">
          {item.servico.emoji || item.cliente_nome.charAt(0)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">{item.cliente_nome}</p>
        <p className="text-xs text-muted-foreground truncate">{item.servico.nome}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-semibold text-primary">{formatTime(item.data_hora_inicio)}</p>
        <div className="mt-0.5"><StatusChip status={item.status} /></div>
      </div>
    </div>
  )
}

export function DashboardPage() {
  const { slug } = useParams<{ slug: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [bannerDismissed, setBannerDismissed] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", slug],
    queryFn: () => getDashboard(slug!),
    enabled: !!slug,
  })

  const { data: perfil } = useQuery({
    queryKey: ["perfil", slug],
    queryFn: () => getPerfil(slug!),
    enabled: !!slug,
  })

  const proximo = data?.proximo_atendimento
  const mins = proximo ? minutesUntil(proximo.data_hora_inicio) : null
  const showBanner = !bannerDismissed && perfil?.primeira_visita === true

  return (
    <div className="space-y-6 max-w-5xl">
      {/* First-visit pending banner */}
      {showBanner && (
        <div className="flex items-start gap-3 rounded-lg bg-amber-50 border border-amber-200 p-4">
          <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">Você tem pendências antes de publicar sua página</p>
            <p className="text-sm text-muted-foreground mt-0.5">
              Recomendamos que você <span className="font-medium text-foreground">altere sua senha</span> no primeiro acesso e{" "}
              <button
                type="button"
                onClick={() => navigate(`/admin/${slug}/personalizar`)}
                className="font-medium text-amber-700 underline underline-offset-2 hover:text-amber-800"
              >
                personalize sua página
              </button>{" "}
              antes de compartilhar com seus clientes.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setBannerDismissed(true)}
            className="text-muted-foreground hover:text-foreground shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div>
        {isLoading ? (
          <Skeleton className="h-8 w-56 mb-1" />
        ) : (
          <h1 className="text-3xl font-bold text-foreground font-playfair">
            {greeting()}, {user?.nome?.split(" ")[0]}
          </h1>
        )}
        <p className="text-sm text-muted-foreground capitalize">{formatDate()}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="border border-border">
              <CardContent className="pt-5 pb-4 px-5">
                <Skeleton className="h-3 w-20 mb-3" />
                <Skeleton className="h-8 w-12" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <StatCard label="Hoje" sublabel="agendamentos" value={data?.stats.hoje ?? 0} color="text-rose-400" />
            <StatCard label="Esta semana" sublabel="confirmados" value={data?.stats.esta_semana ?? 0} color="text-teal-600" />
            <StatCard label="Este mês" sublabel="atendimentos" value={data?.stats.este_mes ?? 0} color="text-blue-400" />
            <StatCard
              label="Receita est."
              sublabel="no mês"
              value={`R$ ${((data?.stats.receita_estimada ?? 0) / 1000).toFixed(1)}k`}
              color="text-amber-500"
            />
          </>
        )}
      </div>

      {/* Main content: agenda + right column */}
      <div className="grid lg:grid-cols-[1fr_420px] gap-4 items-stretch">
        {/* Agenda de hoje */}
        <Card className="border border-border flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-2 shrink-0">
            <CardTitle className="text-base font-semibold font-playfair">Agenda de hoje</CardTitle>
            <Button variant="ghost" size="sm" className="text-xs gap-1 rounded-full" style={{ color: "#2C2025" }}>
              Ver tudo <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto max-h-[calc(100vh-320px)] min-h-0">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 py-3 border-b border-border last:border-0">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-3.5 w-32 mb-1.5" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              ))
            ) : data?.agenda_hoje.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Nenhum agendamento para hoje.
              </p>
            ) : (
              data?.agenda_hoje.map((item) => <AgendamentoRow key={item.id} item={item} />)
            )}
          </CardContent>
        </Card>

        {/* Right column: Ações rápidas + Próximo atendimento */}
        <div className="space-y-4">
          <Card className="border border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold font-playfair">Ações rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-center gap-2 text-sm rounded-full bg-white hover:bg-accent" style={{ color: "#2C2025" }} onClick={() => navigate(`/admin/${slug}/servicos`)}>
                <Scissors className="h-4 w-4 text-primary" />
                Gerenciar serviços
              </Button>
              <Button variant="outline" className="w-full justify-center gap-2 text-sm rounded-full bg-white hover:bg-accent" style={{ color: "#2C2025" }} onClick={() => navigate(`/admin/${slug}/disponibilidade`)}>
                <Clock className="h-4 w-4 text-primary" />
                Configurar disponibilidade
              </Button>
              <Button variant="outline" className="w-full justify-center gap-2 text-sm rounded-full bg-white hover:bg-accent" style={{ color: "#2C2025" }} onClick={() => navigate(`/admin/${slug}/personalizar`)}>
                <Settings className="h-4 w-4 text-primary" />
                Personalizar página
              </Button>
            </CardContent>
          </Card>

          {isLoading ? (
            <Card className="border border-border">
              <CardContent className="pt-5">
                <Skeleton className="h-3 w-24 mb-2" />
                <Skeleton className="h-6 w-36 mb-1" />
                <Skeleton className="h-3 w-40 mb-3" />
                <Skeleton className="h-3 w-28" />
              </CardContent>
            </Card>
          ) : proximo ? (
            <Card className="border-0 bg-primary text-primary-foreground" style={{ background: "linear-gradient(145deg, #C05C6E 0%, #D57C8D 50%, #E09AAA 100%)" }}>
              <CardContent>
                <p className="text-xs font-semibold uppercase tracking-wide opacity-75 mb-2">
                  Próximo atendimento
                </p>
                <p className="text-2xl font-bold font-playfair mb-0.5">{proximo.cliente_nome}</p>
                <p className="text-sm opacity-85 mb-3">
                  {proximo.servico.nome} - {formatTime(proximo.data_hora_inicio)}
                </p>
                <Badge className="gap-1.5 bg-white/20 text-white border-0 hover:bg-white/30">
                  <Clock className="h-3 w-3" />
                  Em {mins} {mins === 1 ? "minuto" : "minutos"}
                </Badge>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  )
}
