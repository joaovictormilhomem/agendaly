import { Link } from "react-router-dom"
import { Clock, CalendarDays } from "lucide-react"
import type { Servico } from "@/types/servico"

interface Props {
  servicos: Servico[]
  slug: string
}

function formatPreco(preco: number) {
  return `R$ ${preco.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}`
}

function formatDuracao(minutos: number) {
  if (minutos < 60) return `${minutos} min`
  const h = Math.floor(minutos / 60)
  const m = minutos % 60
  return m === 0 ? `${h}h` : `${h}h ${m}min`
}

export function ServicosSection({ servicos, slug }: Props) {
  if (servicos.length === 0) return null

  return (
    <section id="servicos" className="py-20 px-6 bg-white">
      <div className="max-w-6xl mx-auto px-12">
        <div className="mb-12">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--color-primary)" }}>
            ✦ Serviços
          </p>
          <h2 className="text-4xl font-bold font-playfair text-foreground">O que eu ofereço</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {servicos.map((servico) => (
            <div
              key={servico.id}
              className="rounded-xl border border-border bg-white p-5 space-y-3 hover:shadow-sm transition-shadow"
            >
              <span className="text-3xl leading-none block">{servico.emoji}</span>
              <p className="text-sm font-semibold text-foreground">{servico.nome}</p>
              <div className="flex items-center justify-between pt-1">
                <span className="text-sm font-bold" style={{ color: "var(--color-primary)" }}>
                  {formatPreco(servico.preco)}
                </span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  {formatDuracao(servico.duracao_minutos)}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center">
          <Link
            to={`/${slug}/agendar`}
            className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-3 rounded-full text-white"
            style={{ background: "var(--color-primary)" }}
          >
            <CalendarDays className="h-4 w-4" />
            Escolher serviço e agendar
          </Link>
        </div>
      </div>
    </section>
  )
}
