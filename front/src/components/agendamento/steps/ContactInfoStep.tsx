import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import type { BookingData } from "@/pages/public/AgendarPage"

interface ContactInfoStepProps {
  onNext: (name: string, whatsapp: string, email: string) => void
  initialData: Partial<BookingData>
}

export function ContactInfoStep({ onNext, initialData }: ContactInfoStepProps) {
  const [name, setName] = useState(initialData.clientName || "")
  const [whatsapp, setWhatsapp] = useState(initialData.clientWhatsapp || "")
  const [email, setEmail] = useState(initialData.clientEmail || "")
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!name.trim()) {
      newErrors.name = "Nome é obrigatório"
    }

    if (!whatsapp.trim()) {
      newErrors.whatsapp = "WhatsApp é obrigatório"
    } else if (!/^\(\d{2}\)\s9?\d{4}-\d{4}$/.test(whatsapp)) {
      newErrors.whatsapp = "Formato: (XX) 9XXXX-XXXX"
    }

    if (!email.trim()) {
      newErrors.email = "E-mail é obrigatório"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "E-mail inválido"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleContinue = () => {
    if (validateForm()) {
      onNext(name, whatsapp, email)
    }
  }

  const formatWhatsapp = (value: string) => {
    const cleaned = value.replace(/\D/g, "")
    if (cleaned.length <= 11) {
      if (cleaned.length <= 2) {
        return cleaned ? `(${cleaned}` : ""
      } else if (cleaned.length <= 7) {
        return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`
      } else {
        return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`
      }
    }
    return whatsapp
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h2 className="text-2xl font-bold font-playfair text-foreground">Seus dados de contato</h2>
      </div>

      <div className="space-y-4">
        {/* Name field */}
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">Nome completo *</label>
          <Input
            placeholder="Seu nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={errors.name ? "border-destructive bg-white" : "bg-white"}
          />
          {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
        </div>

        {/* WhatsApp field */}
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">WhatsApp *</label>
          <Input
            placeholder="(63) 99999-9999"
            value={whatsapp}
            onChange={(e) => setWhatsapp(formatWhatsapp(e.target.value))}
            className={errors.whatsapp ? "border-destructive bg-white" : "bg-white"}
          />
          {errors.whatsapp && <p className="text-sm text-destructive mt-1">{errors.whatsapp}</p>}
        </div>

        {/* Email field */}
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">E-mail *</label>
          <Input
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={errors.email ? "border-destructive bg-white" : "bg-white"}
          />
          {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
        </div>

        {/* Info alert */}
        <Card className="p-4 bg-primary/5 border-primary/20 flex gap-3">
          <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <p className="text-sm text-foreground">
            Você receberá a confirmação por WhatsApp. Em caso de cancelamento, avise com antecedência de 2h.
          </p>
        </Card>
      </div>

      <div className="flex justify-center sm:justify-end">
        <Button onClick={handleContinue} size="lg" className="w-full sm:w-auto rounded-full">
          Continuar
        </Button>
      </div>
    </div>
  )
}
