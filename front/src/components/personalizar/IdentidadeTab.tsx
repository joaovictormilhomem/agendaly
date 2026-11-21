import { useRef } from "react"
import { Control } from "react-hook-form"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { ImagePlus, Info } from "lucide-react"
import { toast } from "sonner"
import type { PerfilFormValues } from "@/pages/admin/PersonalizarPage"

interface Props {
  control: Control<PerfilFormValues>
  slug: string
  logoUrl: string
  imagePending: boolean
  disabled: boolean
  onImageChange: (image: File | null) => void
}

const acceptedImageTypes = ["image/jpeg", "image/png", "image/webp"]

export function IdentidadeTab({ control, slug, logoUrl, imagePending, disabled, onImageChange }: Props) {
  const fileInput = useRef<HTMLInputElement>(null)

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border p-6 space-y-6 bg-card">
        <h2 className="text-base font-semibold font-playfair">Identidade do negócio</h2>

        {/* Logo / Foto de perfil */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Logo / Foto de perfil</p>
          <p id="profile-image-help" className="text-xs text-muted-foreground">JPG, PNG ou WebP de até 5 MB. Recomendado 400 × 400 px.</p>
          <div className="flex items-center gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary">
              {logoUrl ? (
                <img src={logoUrl} alt="Prévia da foto de perfil" className="size-full object-cover" />
              ) : (
                <span className="font-playfair text-xl font-bold text-primary-foreground">N</span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <input
                ref={fileInput}
                type="file"
                accept={acceptedImageTypes.join(",")}
                hidden
                disabled={disabled}
                onChange={(event) => {
                  const image = event.currentTarget.files?.[0]
                  event.currentTarget.value = ""
                  if (!image) return
                  if (!acceptedImageTypes.includes(image.type) || image.size > 5 * 1024 * 1024) {
                    toast.error("Use JPG, PNG ou WebP com até 5 MB.")
                    return
                  }
                  onImageChange(image)
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                aria-describedby="profile-image-help"
                disabled={disabled}
                onClick={() => fileInput.current?.click()}
              >
                <ImagePlus className="size-4" /> {logoUrl ? "Trocar foto" : "Adicionar foto"}
              </Button>
              {logoUrl && (
                <Button type="button" variant="ghost" size="sm" disabled={disabled} onClick={() => onImageChange(null)}>
                  Remover foto
                </Button>
              )}
            </div>
          </div>
          {imagePending && <p role="status" className="text-xs text-muted-foreground">Clique em Publicar para salvar a alteração.</p>}
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
