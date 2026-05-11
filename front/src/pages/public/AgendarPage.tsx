import { useState } from "react"
import { useParams } from "react-router-dom"
import { ServiceSelectionStep } from "@/components/agendamento/steps/ServiceSelectionStep"
import { DateTimeStep } from "@/components/agendamento/steps/DateTimeStep"
import { ContactInfoStep } from "@/components/agendamento/steps/ContactInfoStep"
import { ConfirmationStep } from "@/components/agendamento/steps/ConfirmationStep"
import { SuccessFeedback } from "@/components/agendamento/SuccessFeedback"
import { Stepper } from "@/components/agendamento/Stepper"
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

      const [hours, minutes] = bookingData.time.split(":").map(Number)
      const startDateTime = new Date(bookingData.date)
      startDateTime.setHours(hours, minutes, 0, 0)

      const endDateTime = new Date(startDateTime)
      endDateTime.setMinutes(endDateTime.getMinutes() + bookingData.service.duracao_minutos)

      const agendamentoData = {
        servico_id: bookingData.service.id,
        cliente_nome: bookingData.clientName,
        cliente_whatsapp: bookingData.clientWhatsapp,
        cliente_email: bookingData.clientEmail,
        data_hora_inicio: startDateTime.toISOString(),
        data_hora_fim: endDateTime.toISOString(),
      }

      // TODO: Replace with actual API call
      console.log("Submitting booking:", agendamentoData)

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      setShowSuccess(true)
    } catch (error) {
      console.error("Erro ao confirmar agendamento:", error)
      // TODO: Show error toast
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
          {currentStep === 2 && (
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
