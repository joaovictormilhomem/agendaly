import { useFormContext, useWatch, useFieldArray } from "react-hook-form"
import { Plus, X } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import type { DisponibilidadeFormValues } from "@/pages/admin/DisponibilidadePage"

const DIAS_LABEL = ["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado", "Domingo"]

interface Props {
  index: number
}

export function DiaRow({ index }: Props) {
  const { control, register, setValue } = useFormContext<DisponibilidadeFormValues>()
  const ativo = useWatch({ control, name: `dias.${index}.ativo` })

  const { fields, append, remove } = useFieldArray({
    control: control as never,
    name: `dias.${index}.intervalos` as never,
  })

  return (
    <div className="py-3 border-t border-border">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Switch
            checked={ativo}
            onCheckedChange={(val) => setValue(`dias.${index}.ativo`, val)}
          />
          <span className={`text-sm font-medium ${ativo ? "text-foreground" : "text-muted-foreground"}`}>
            {DIAS_LABEL[index]}
          </span>
        </div>
        {ativo && (
          <button
            type="button"
            onClick={() => append({ hora_inicio: "09:00", hora_fim: "18:00" })}
            className="flex items-center justify-center w-6 h-6 rounded-full border border-dashed border-primary/50 text-primary/60 hover:border-primary hover:text-primary transition-colors"
          >
            <Plus className="h-3 w-3" />
          </button>
        )}
      </div>

      {ativo ? (
        <div className="mt-2 space-y-2 ml-11">
          {(fields as { id: string }[]).map((field, i) => (
            <div key={field.id} className="flex items-center gap-2">
              <input
                type="time"
                {...register(`dias.${index}.intervalos.${i}.hora_inicio` as never)}
                className="h-9 w-28 rounded-md border border-input bg-transparent px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <span className="text-sm text-muted-foreground">até</span>
              <input
                type="time"
                {...register(`dias.${index}.intervalos.${i}.hora_fim` as never)}
                className="h-9 w-28 rounded-md border border-input bg-transparent px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
              {fields.length > 1 && (
                <button
                  type="button"
                  onClick={() => remove(i)}
                  className="flex items-center justify-center w-5 h-5 rounded-full bg-muted text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground mt-1 ml-11">Indisponível</p>
      )}
    </div>
  )
}
