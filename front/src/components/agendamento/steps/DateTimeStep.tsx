import { useEffect, useState } from "react"
import { isSameDay } from "date-fns"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"
import { getSlotsDisponiveis } from "@/api/public/slots"
import type { Servico } from "@/types/servico"

interface DateTimeStepProps {
  slug: string
  service: Servico
  bookedDates?: Date[]
  onSelect: (date: Date, time: string) => void
}

export function DateTimeStep({ slug, service, bookedDates = [], onSelect }: DateTimeStepProps) {
  const tomorrow = new Date(new Date().getTime() + 24 * 60 * 60 * 1000)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(tomorrow)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [slots, setSlots] = useState<string[]>([])
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)

  useEffect(() => {
    if (!selectedDate) return
    setIsLoadingSlots(true)
    setSelectedTime(null)
    getSlotsDisponiveis(slug, selectedDate, service.id)
      .then((rows) => setSlots(rows.filter((r) => r.disponivel).map((r) => r.hora)))
      .catch((err: unknown) => {
        console.error(err)
        setSlots([])
        toast.error("Não foi possível carregar os horários. Verifique se o serviço está ativo e tente outra data.")
      })
      .finally(() => setIsLoadingSlots(false))
  }, [slug, selectedDate, service.id])

  const isDateDisabled = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const d = new Date(date)
    d.setHours(0, 0, 0, 0)
    if (d < today) return true
    return bookedDates.some((booked) => isSameDay(booked, date))
  }

  const handleContinue = () => {
    if (selectedDate && selectedTime) {
      onSelect(selectedDate, selectedTime)
    }
  }

  const formattedDate = selectedDate?.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold font-playfair text-foreground">Escolha data e horário</h2>

      <Card className="gap-0 p-0 border-2 border-border overflow-hidden">
        <CardContent className="relative p-0 md:pr-70">
          <div className="p-6 flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              defaultMonth={selectedDate}
              disabled={isDateDisabled}
              showOutsideDays={false}
              modifiers={{ booked: bookedDates }}
              modifiersClassNames={{ booked: "[&>button]:line-through opacity-100" }}
              className="bg-transparent p-0 [--cell-size:--spacing(10)]"
            />
          </div>

          <div className="inset-y-0 right-0 flex w-full flex-col gap-4 border-t max-md:h-60 md:absolute md:w-70 md:border-t-0 md:border-l">
            <ScrollArea className="h-full">
              <div className="flex flex-col gap-2 p-4">
                {isLoadingSlots ? (
                  <p className="text-sm text-muted-foreground text-center py-4">Carregando...</p>
                ) : slots.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhum horário disponível.
                  </p>
                ) : (
                  slots.map((time) => (
                    <Button
                      key={time}
                      variant={selectedTime === time ? "default" : "outline"}
                      onClick={() => setSelectedTime(time)}
                      className="w-full shadow-none"
                    >
                      {time}
                    </Button>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4 border-t px-6 py-5 md:flex-row">
          <p className="text-sm text-muted-foreground flex-1">
            {selectedDate && selectedTime ? (
              <span>
                <span className="font-medium capitalize">{formattedDate}</span> às{" "}
                <span className="font-medium">{selectedTime}</span>
              </span>
            ) : (
              "Selecione uma data e um horário."
            )}
          </p>
          <div className="flex justify-center sm:justify-end w-full md:w-auto">
            <Button
              onClick={handleContinue}
              disabled={!selectedDate || !selectedTime}
              size="lg"
              className="w-full sm:w-auto rounded-full"
            >
              Continuar
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
