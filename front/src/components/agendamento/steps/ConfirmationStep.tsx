import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Loader2, CheckCircle2 } from "lucide-react"
import type { BookingData } from "@/pages/public/AgendarPage"

interface ConfirmationStepProps {
  bookingData: BookingData
  onConfirm: () => void
  isSubmitting: boolean
}

export function ConfirmationStep({ bookingData, onConfirm, isSubmitting }: ConfirmationStepProps) {
  if (!bookingData.service || !bookingData.date || !bookingData.time) {
    return <div>Dados de agendamento incompletos</div>
  }

  const formattedDate = bookingData.date.toLocaleDateString("pt-BR")

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h2 className="text-2xl font-bold font-playfair text-foreground">Confirmar agendamento</h2>
      </div>

      <Card className="p-6 border-2 border-border">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
          <div className="text-4xl">{bookingData.service.emoji}</div>
          <div>
            <h3 className="font-semibold text-foreground text-lg">{bookingData.service.nome}</h3>
            <p className="text-sm text-muted-foreground">{bookingData.service.descricao}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between py-2 border-b border-border/50">
            <span className="text-muted-foreground">Data</span>
            <span className="font-medium text-foreground">{formattedDate}</span>
          </div>

          <div className="flex justify-between py-2 border-b border-border/50">
            <span className="text-muted-foreground">Horário</span>
            <span className="font-medium text-foreground">{bookingData.time}</span>
          </div>

          <div className="flex justify-between py-2 border-b border-border/50">
            <span className="text-muted-foreground">Valor</span>
            <span className="font-medium text-foreground">R$ {bookingData.service.preco.toFixed(2).replace(".", ",")}</span>
          </div>

          <div className="flex justify-between py-2 border-b border-border/50">
            <span className="text-muted-foreground">Duração</span>
            <span className="font-medium text-foreground">{bookingData.service.duracao_minutos} min</span>
          </div>

          <div className="flex justify-between py-2  border-b border-border/50">
            <span className="text-muted-foreground">Nome</span>
            <span className="font-medium text-foreground">{bookingData.clientName}</span>
          </div>

          <div className="flex justify-between py-2  border-b border-border/50">
            <span className="text-muted-foreground">WhatsApp</span>
            <span className="font-medium text-foreground">{bookingData.clientWhatsapp}</span>
          </div>

          <div className="flex justify-between py-2">
            <span className="text-muted-foreground">E-mail</span>
            <span className="font-medium text-foreground">{bookingData.clientEmail}</span>
          </div>
        </div>
      </Card>

      <div className="flex justify-center sm:justify-end">
        <Button
          onClick={onConfirm}
          disabled={isSubmitting}
          size="lg"
          className="w-full sm:w-auto rounded-full gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Confirmando...
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4" />
              Confirmar agendamento
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
