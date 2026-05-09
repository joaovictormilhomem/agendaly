import { Control } from "react-hook-form"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import type { PerfilFormValues } from "@/pages/admin/PersonalizarPage"

interface Props {
  control: Control<PerfilFormValues>
}

export function HeroTab({ control }: Props) {
  return (
    <div className="rounded-lg border border-border p-6 space-y-6 bg-card">
      <h2 className="text-base font-semibold font-playfair">Seção principal (Hero)</h2>

      <FormField
        control={control}
        name="hero_titulo"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Título principal</FormLabel>
            <p className="text-xs text-muted-foreground -mt-1">Primeira linha do título grande</p>
            <FormControl>
              <Input placeholder="Unhas que contam" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="hero_titulo_destaque"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Título em destaque <span className="text-muted-foreground font-normal">(itálico colorido)</span></FormLabel>
            <p className="text-xs text-muted-foreground -mt-1">Segunda linha — aparece na cor principal</p>
            <FormControl>
              <Input placeholder="a sua história" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="hero_subtitulo"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Subtítulo / descrição</FormLabel>
            <p className="text-xs text-muted-foreground -mt-1">Texto de apoio abaixo do título</p>
            <FormControl>
              <Textarea
                placeholder="Especialista em alongamentos, nail art e esmaltação em gel..."
                className="resize-none min-h-[100px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <Separator />

      <p className="text-sm font-semibold text-foreground">Banner de chamada (rodapé)</p>

      <FormField
        control={control}
        name="banner_titulo"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Título do banner</FormLabel>
            <FormControl>
              <Input placeholder="Pronta para unhas incríveis?" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="banner_subtitulo"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Subtítulo do banner</FormLabel>
            <FormControl>
              <Input placeholder="Agende online agora mesmo — disponível 24 horas" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
