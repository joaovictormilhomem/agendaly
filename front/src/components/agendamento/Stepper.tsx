import { Check, ChevronLeft } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

const STEP_LABELS = ["Serviço", "Data e Hora", "Dados", "Confirmação"]

interface StepperProps {
  currentStep: number
  totalSteps: number
  onStepChange: (step: number) => void
  backPath?: string
}

export function Stepper({ currentStep, totalSteps, onStepChange, backPath }: StepperProps) {
  const navigate = useNavigate()

  const handleBack = () => {
    if (currentStep === 1 && backPath) {
      navigate(backPath)
    } else {
      onStepChange(Math.max(1, currentStep - 1))
    }
  }

  const progressValue = ((currentStep - 1) / (totalSteps - 1)) * 100

  return (
    <div className="space-y-4">
      {/* Step indicators */}
      <div className="relative">
        {/* Background track */}
        <div className="absolute top-[18px] left-[18px] right-[18px] h-0.5 bg-muted" />
        {/* Filled track */}
        <div
          className="absolute top-[18px] left-[18px] h-0.5 bg-primary transition-all duration-500"
          style={{ width: `calc((100% - 36px) * ${progressValue / 100})` }}
        />

        <div className="relative flex justify-between">
          {STEP_LABELS.slice(0, totalSteps).map((label, index) => {
            const stepNumber = index + 1
            const isCompleted = stepNumber < currentStep
            const isActive = stepNumber === currentStep

            return (
              <div key={index} className="flex flex-col items-center gap-2">
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all duration-300",
                    isCompleted && "border-primary bg-primary text-primary-foreground",
                    isActive &&
                      "border-primary bg-primary text-primary-foreground shadow-[0_0_0_4px_color-mix(in_srgb,var(--color-primary)_15%,transparent)]",
                    !isCompleted && !isActive && "border-border bg-background text-muted-foreground"
                  )}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : stepNumber}
                </div>
                <span
                  className={cn(
                    "hidden text-xs font-medium sm:block",
                    isActive ? "font-semibold text-primary" : "text-muted-foreground"
                  )}
                >
                  {label}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Mobile: progress bar + current label */}
      <div className="sm:hidden space-y-2">
        <Progress value={progressValue} />
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">
          {STEP_LABELS[currentStep - 1]}
        </p>
      </div>

      {/* Navigation row */}
      <div className="flex items-center">
        <Button variant="ghost" size="sm" onClick={handleBack} className="-ml-2 gap-1">
          <ChevronLeft className="h-4 w-4" />
          Voltar
        </Button>
      </div>
    </div>
  )
}
