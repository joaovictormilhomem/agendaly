import { Control } from "react-hook-form"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Instagram, Phone, Star } from "lucide-react"
import type { PerfilFormValues } from "@/pages/admin/PersonalizarPage"

interface Props {
  control: Control<PerfilFormValues>
}

export function ContatoTab({ control }: Props) {
  return (
    <div className="rounded-lg border border-border p-6 space-y-6 bg-card">
      <h2 className="text-base font-semibold font-playfair">Contato e redes sociais</h2>

      <FormField
        control={control}
        name="endereco"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Endereço / Cidade de atendimento</FormLabel>
            <FormControl>
              <Input placeholder="Palmas - TO" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="instagram"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Instagram</FormLabel>
            <p className="text-xs text-muted-foreground -mt-1">Ex: @naile_studio</p>
            <FormControl>
              <div className="relative">
                <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input className="pl-9" placeholder="@naile_studio" {...field} />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="whatsapp"
        render={({ field }) => (
          <FormItem>
            <FormLabel>WhatsApp</FormLabel>
            <p className="text-xs text-muted-foreground -mt-1">Número com DDD</p>
            <FormControl>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input className="pl-9" placeholder="(63) 99999-9999" {...field} />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="flex items-start gap-3 rounded-lg bg-primary/10 border border-primary/20 p-4">
        <Star className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-foreground">Dica</p>
          <p className="text-sm text-muted-foreground">
            Deixe em branco campos que não quiser exibir na sua página pública.
          </p>
        </div>
      </div>
    </div>
  )
}
