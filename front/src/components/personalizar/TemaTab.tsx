import { Control, useWatch } from "react-hook-form"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"
import type { PerfilFormValues } from "@/pages/admin/PersonalizarPage"

interface Props {
  control: Control<PerfilFormValues>
}

const PRIMARY_PRESETS = ["#D4788A", "#4A90D9", "#4CAF7D", "#D4A017", "#7C5CBF", "#8B4513"]
const SECONDARY_PRESETS = ["#F2C4CE", "#B8D4F0", "#B8E0CA", "#F0DFA0", "#C4B0E8", "#D4A890"]

interface ColorPickerProps {
  control: Control<PerfilFormValues>
  name: "cor_principal" | "cor_secundaria"
  label: string
  description: string
  presets: string[]
}

function ColorPicker({ control, name, label, description, presets }: ColorPickerProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <p className="text-xs text-muted-foreground -mt-1">{description}</p>
          <FormControl>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {presets.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => field.onChange(color)}
                    className={cn(
                      "w-9 h-9 rounded-full flex items-center justify-center transition-all",
                      "ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    )}
                    style={{ backgroundColor: color }}
                  >
                    {field.value === color && <Check className="h-4 w-4 text-white drop-shadow" />}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={/^#[0-9A-Fa-f]{6}$/.test(field.value) ? field.value : "#D4788A"}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.onChange(e.target.value)}
                  className="w-9 h-9 rounded cursor-pointer border border-border bg-transparent p-0.5"
                />
                <span className="text-xs font-mono text-muted-foreground">{field.value}</span>
              </div>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export function TemaTab({ control }: Props) {
  const corPrincipal = useWatch({ control, name: "cor_principal" })
  const corSecundaria = useWatch({ control, name: "cor_secundaria" })

  const validPrimary = /^#[0-9A-Fa-f]{6}$/.test(corPrincipal) ? corPrincipal : "#D4788A"
  const validSecondary = /^#[0-9A-Fa-f]{6}$/.test(corSecundaria) ? corSecundaria : "#F2C4CE"

  return (
    <div className="rounded-lg border border-border p-6 space-y-8 bg-card">
      <h2 className="text-base font-semibold font-playfair">Tema de cores</h2>

      <ColorPicker
        control={control}
        name="cor_principal"
        label="Cor principal"
        description="Usada em botões, destaques, links e elementos coloridos da sua página"
        presets={PRIMARY_PRESETS}
      />

      <ColorPicker
        control={control}
        name="cor_secundaria"
        label="Cor secundária"
        description="Usada em backgrounds e detalhes secundários"
        presets={SECONDARY_PRESETS}
      />

      {/* Live preview */}
      <div className="rounded-lg p-4 space-y-3" style={{ backgroundColor: validSecondary + "33" }}>
        <p className="text-sm font-semibold text-foreground">Prévia dos elementos com essa cor</p>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            className="px-4 py-2 rounded-full text-sm font-semibold text-white"
            style={{ backgroundColor: validPrimary }}
          >
            Agendar
          </button>
          <button
            type="button"
            className="px-4 py-2 rounded-full text-sm font-semibold border"
            style={{ borderColor: validPrimary, color: validPrimary }}
          >
            Ver portfólio
          </button>
          <span className="text-sm font-semibold" style={{ color: validPrimary }}>
            R$ 120
          </span>
        </div>
      </div>
    </div>
  )
}
