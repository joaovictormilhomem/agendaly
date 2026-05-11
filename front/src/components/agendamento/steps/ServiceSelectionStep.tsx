import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, CheckCircle2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { getServicosPublicos } from "@/api/public/servicos"
import type { Servico } from "@/types/servico"

interface ServiceSelectionStepProps {
  slug: string
  onServiceSelect: (service: Servico) => void
}

export function ServiceSelectionStep({ slug, onServiceSelect }: ServiceSelectionStepProps) {
  const [services, setServices] = useState<Servico[]>([])
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getServicosPublicos(slug)
      .then(setServices)
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [slug])

  const handleContinue = () => {
    const selected = services.find((s) => s.id === selectedServiceId)
    if (selected) {
      onServiceSelect(selected)
    }
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
        {services.map((service) => (
          <Card
            key={service.id}
            onClick={() => setSelectedServiceId(service.id)}
            className={`p-4 cursor-pointer transition-all border-2 ${
              selectedServiceId === service.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{service.emoji}</span>
                  <h3 className="font-semibold text-foreground">{service.nome}</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{service.descricao}</p>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-primary">
                    R$ {service.preco.toFixed(2).replace(".", ",")}
                  </span>
                  <Badge variant="secondary" className="gap-1 font-normal">
                    <Clock className="h-3 w-3" />
                    {service.duracao_minutos} min
                  </Badge>
                </div>
              </div>
              {selectedServiceId === service.id && (
                <CheckCircle2 className="h-6 w-6 text-primary shrink-0 mt-1" />
              )}
            </div>
          </Card>
        ))}
      </div>

      <div className="flex justify-center sm:justify-end">
        <Button
          onClick={handleContinue}
          disabled={!selectedServiceId}
          size="lg"
          className="w-full sm:w-auto rounded-full"
        >
          Continuar
        </Button>
      </div>
    </div>
  )
}
