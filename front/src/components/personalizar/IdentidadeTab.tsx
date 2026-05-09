import { Control, useWatch } from "react-hook-form"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Info } from "lucide-react"
import type { PerfilFormValues } from "@/pages/admin/PersonalizarPage"

interface Props {
  control: Control<PerfilFormValues>
  slug: string
}

export function IdentidadeTab({ control, slug }: Props) {
  const logoUrl = useWatch({ control, name: "logo_url" })

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border p-6 space-y-6 bg-card">
        <h2 className="text-base font-semibold font-playfair">Identidade do negócio</h2>

        {/* Logo / Foto de perfil */}
        <div className="space-y-2">
          <FormField
            control={control}
            name="logo_url"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-1.5">
                  <FormLabel>Logo / Foto de perfil</FormLabel>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>Você pode deixar a letra padrão ou adicionar uma imagem personalizada</TooltipContent>
                  </Tooltip>
                </div>
                <p className="text-xs text-muted-foreground -mt-1">PNG, JPG ou SVG · Recomendado 400 × 400px</p>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full shrink-0 bg-primary flex items-center justify-center overflow-hidden">
                    {logoUrl ? (
                      <img src={logoUrl} alt="preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xl font-bold font-playfair text-primary-foreground">N</span>
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">
                      Cole o link de uma imagem hospedada em qualquer serviço (Instagram, Google Fotos, Imgur, etc.)
                    </p>
                    <FormMessage />
                  </div>
                </div>
              </FormItem>
            )}
          />
        </div>

        {/* Nome do negócio */}
        <FormField
          control={control}
          name="nome_exibicao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do negócio</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Nailê Studio" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Tagline */}
        <FormField
          control={control}
          name="tagline"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tagline <span className="text-muted-foreground font-normal">(abaixo do logo na navbar)</span></FormLabel>
              <p className="text-xs text-muted-foreground -mt-1">Ex: Nail Designer Profissional</p>
              <FormControl>
                <Input placeholder="Nail Designer Profissional" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Nome profissional + Especialidade */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={control}
            name="nome_profissional"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome da profissional</FormLabel>
                <FormControl>
                  <Input placeholder="Nailê Sousa" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="especialidade"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título / Especialidade</FormLabel>
                <FormControl>
                  <Input placeholder="Nail Designer" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Slug read-only */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium">Slug da URL</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>O endereço da sua página não pode ser alterado</TooltipContent>
            </Tooltip>
          </div>
          <p className="text-xs text-muted-foreground">Endereço público da sua página</p>
          <div className="flex items-center rounded-md border border-border bg-muted px-3 h-9 text-sm text-muted-foreground">
            <span className="text-foreground/40">agendaai.app/</span>
            <span className="text-foreground font-medium">{slug}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
