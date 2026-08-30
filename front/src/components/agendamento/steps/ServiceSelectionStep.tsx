import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, CheckCircle2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { getServicosPublicos } from "@/api/public/servicos"
import {
  formatPrecoServico,
  idsObrigatorios,
  totaisServico,
  type Servico,
} from "@/types/servico"
import { cn } from "@/lib/utils"

interface ServiceSelectionStepProps {
  slug: string
  onServiceSelect: (service: Servico, incrementoIds: string[]) => void
}

export function ServiceSelectionStep({ slug, onServiceSelect }: ServiceSelectionStepProps) {
  const [services, setServices] = useState<Servico[]>([])
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null)
  const [selectedIncrementoIds, setSelectedIncrementoIds] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getServicosPublicos(slug)
      .then((list) =>
        setServices(
          list.map((s) => ({
            ...s,
            incrementos: s.incrementos ?? [],
          }))
        )
      )
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [slug])

  const selected = services.find((s) => s.id === selectedServiceId) ?? null
  const hasIncrementos = (selected?.incrementos.length ?? 0) > 0

  const handleSelectService = (service: Servico) => {
    setSelectedServiceId(service.id)
    setSelectedIncrementoIds(idsObrigatorios(service))
  }

  const toggleIncremento = (id: string, obrigatorio: boolean) => {
    if (obrigatorio) return
    setSelectedIncrementoIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const canContinue =
    !!selected &&
    (!hasIncrementos || totaisServico(selected, selectedIncrementoIds).incrementos.length > 0)

  const handleContinue = () => {
    if (!selected || !canContinue) return
    const ids = hasIncrementos
      ? [...new Set([...idsObrigatorios(selected), ...selectedIncrementoIds])]
      : []
    onServiceSelect(selected, ids)
  }

  if (isLoading) {
    return <div className="text-center py-8">Carregando serviços...</div>
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h2 className="text-2xl font-bold font-playfair text-foreground">Qual serviço você deseja?</h2>
      </div>

      <div className="space-y-3">
        {services.map((service) => {
          const isSelected = selectedServiceId === service.id
          const showOpcoes = isSelected && (service.incrementos?.length ?? 0) > 0
          const totaisCard =
            showOpcoes && selected ? totaisServico(service, selectedIncrementoIds) : null

          return (
            <Card
              key={service.id}
              onClick={() => handleSelectService(service)}
              className={cn(
                "p-4 cursor-pointer transition-all border-2",
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{service.emoji}</span>
                    <h3 className="font-semibold text-foreground">{service.nome}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{service.descricao}</p>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-primary">
                      {totaisCard && totaisCard.incrementos.length > 0
                        ? totaisCard.preco.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })
                        : formatPrecoServico(service)}
                    </span>
                    <Badge variant="secondary" className="gap-1 font-normal">
                      <Clock className="h-3 w-3" />
                      {totaisCard && totaisCard.incrementos.length > 0
                        ? `${totaisCard.duracao_minutos} min`
                        : (service.incrementos?.length ?? 0) > 0
                          ? `a partir de ${service.duracao_minutos} min`
                          : `${service.duracao_minutos} min`}
                    </Badge>
                  </div>
                </div>
                {isSelected && (
                  <CheckCircle2 className="h-6 w-6 text-primary shrink-0 mt-1" />
                )}
              </div>

              {showOpcoes && (
                <div
                  className="mt-4 pt-4 border-t border-border/60 space-y-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Escolha as opções
                  </p>
                  {service.incrementos.map((inc) => {
                    const checked =
                      selectedIncrementoIds.includes(inc.id) || inc.obrigatorio
                    return (
                      <button
                        key={inc.id}
                        type="button"
                        disabled={inc.obrigatorio}
                        onClick={() => toggleIncremento(inc.id, inc.obrigatorio)}
                        className={cn(
                          "w-full flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-left transition-all bg-background/80",
                          checked
                            ? "border-primary ring-1 ring-primary/30"
                            : "border-border hover:border-primary/50",
                          inc.obrigatorio && "opacity-90 cursor-default"
                        )}
                      >
                        <div>
                          <p className="font-medium text-sm text-foreground">
                            {inc.nome}
                            {inc.obrigatorio && (
                              <span className="ml-2 text-xs text-muted-foreground font-normal">
                                Obrigatório
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {inc.duracao_minutos} min ·{" "}
                            {inc.preco.toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })}
                          </p>
                        </div>
                        {checked && (
                          <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </Card>
          )
        })}
      </div>

      <div className="flex justify-center sm:justify-end">
        <Button
          onClick={handleContinue}
          disabled={!canContinue}
          size="lg"
          className="w-full sm:w-auto rounded-full"
        >
          Continuar
        </Button>
      </div>
    </div>
  )
}
