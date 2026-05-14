import { useState } from "react"
import { useParams } from "react-router-dom"
import { toast } from "sonner"
import { ServiceSelectionStep } from "@/components/agendamento/steps/ServiceSelectionStep"
import { DateTimeStep } from "@/components/agendamento/steps/DateTimeStep"
import { ContactInfoStep } from "@/components/agendamento/steps/ContactInfoStep"
import { ConfirmationStep } from "@/components/agendamento/steps/ConfirmationStep"
import { SuccessFeedback } from "@/components/agendamento/SuccessFeedback"
import { Stepper } from "@/components/agendamento/Stepper"
import { agendarPublico, parseAgendarConflict } from "@/api/public/agendar"
import { combineDateAndTimeToIso } from "@/lib/datetime"
import type { Servico } from "@/types/servico"

export interface BookingData {
  service: Servico | null
  date: Date | null
  time: string | null
  clientName: string
  clientWhatsapp: string
  clientEmail: string
}

const INITIAL_STATE: BookingData = {
  service: null,
  date: null,
  time: null,
  clientName: "",
  clientWhatsapp: "",
  clientEmail: "",
}

export function AgendarPage() {
  const { slug } = useParams<{ slug: string }>()
  const [currentStep, setCurrentStep] = useState(1)
  const [bookingData, setBookingData] = useState<BookingData>(INITIAL_STATE)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  if (!slug) {
    return <div className="min-h-screen flex items-center justify-center">Profissional não encontrada</div>
  }

  if (showSuccess) {
    return <SuccessFeedback slug={slug} />
  }

  const handleStepChange = (step: number) => {
    setCurrentStep(step)
  }

  const handleServiceSelect = (service: Servico) => {
    setBookingData((prev) => ({ ...prev, service }))
    setCurrentStep(2)
  }

  const handleDateTimeSelect = (date: Date, time: string) => {
    setBookingData((prev) => ({ ...prev, date, time }))
    setCurrentStep(3)
  }

  const handleContactInfoChange = (name: string, whatsapp: string, email: string) => {
    setBookingData((prev) => ({
      ...prev,
      clientName: name,
      clientWhatsapp: whatsapp,
      clientEmail: email,
    }))
    setCurrentStep(4)
  }

  const handleConfirmBooking = async () => {
    setIsSubmitting(true)
    try {
      if (!bookingData.service || !bookingData.date || !bookingData.time) {
        throw new Error("Dados de agendamento incompletos")
      }

      const slot_datetime = combineDateAndTimeToIso(bookingData.date, bookingData.time)

      await agendarPublico(slug, {
        cliente_nome: bookingData.clientName,
        cliente_whatsapp: bookingData.clientWhatsapp.replace(/\D/g, "").slice(0, 20),
        cliente_email: bookingData.clientEmail.trim() || undefined,
        servicoId: bookingData.service.id,
        slot_datetime,
      })

      setShowSuccess(true)
    } catch (error) {
      const conflict = parseAgendarConflict(error)
      if (conflict) {
        toast.error(conflict.mensagem, {
          description:
            conflict.slots_sugeridos.length > 0
              ? `Sugestões: ${conflict.slots_sugeridos.join(", ")}`
              : undefined,
        })
      } else {
        console.error("Erro ao confirmar agendamento:", error)
        toast.error("Não foi possível concluir o agendamento. Tente novamente.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-12 px-6 lg:px-12">
      <div className="max-w-2xl mx-auto">
        <Stepper currentStep={currentStep} totalSteps={4} onStepChange={handleStepChange} backPath={`/${slug}`} />

        <div className="mt-12">
          {currentStep === 1 && <ServiceSelectionStep slug={slug} onServiceSelect={handleServiceSelect} />}
          {currentStep === 2 && bookingData.service && (
            <DateTimeStep
              slug={slug}
              service={bookingData.service}
              onSelect={handleDateTimeSelect}
            />
          )}
          {currentStep === 3 && (
            <ContactInfoStep
              onNext={handleContactInfoChange}
              initialData={bookingData}
            />
          )}
          {currentStep === 4 && (
            <ConfirmationStep
              bookingData={bookingData}
              onConfirm={handleConfirmBooking}
              isSubmitting={isSubmitting}
            />
          )}
        </div>
      </div>
    </div>
  )
}
