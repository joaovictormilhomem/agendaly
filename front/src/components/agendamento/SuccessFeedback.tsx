import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SuccessFeedbackProps {
  slug: string
}

export function SuccessFeedback({ slug }: SuccessFeedbackProps) {
  const navigate = useNavigate()
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 300)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6 pt-16">
      <div className="max-w-sm w-full space-y-6 text-center">
        {/* Animated check icon */}
        <div className="flex justify-center">
          <div
            className={`w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center transition-all duration-500 ${
              showContent ? "scale-100 opacity-100" : "scale-0 opacity-0"
            }`}
          >
            <Check
              className={`w-10 h-10 text-primary transition-all duration-700 ${
                showContent ? "scale-100 opacity-100" : "scale-0 opacity-0"
              }`}
              strokeWidth={3}
            />
          </div>
        </div>

        {/* Title */}
        <div
          className={`transition-all duration-500 ${
            showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          }`}
        >
          <h1 className="text-3xl font-bold font-playfair text-foreground">
            Agendamento realizado! 🎉
          </h1>
        </div>

        {/* Subtitle */}
        <div
          className={`transition-all duration-500 delay-100 ${
            showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          }`}
        >
          <p className="text-base text-muted-foreground">
            Você receberá uma confirmação no WhatsApp em instantes.
          </p>
        </div>

        {/* Button */}
        <div
          className={`transition-all duration-500 delay-200 ${
            showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          }`}
        >
          <Button
            onClick={() => navigate(`/${slug}`)}
            className="w-full"
            size="lg"
          >
            Voltar à página da profissional
          </Button>
        </div>
      </div>
    </div>
  )
}
