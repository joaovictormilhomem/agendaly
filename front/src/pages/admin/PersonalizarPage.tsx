import { useEffect } from "react"
import { useParams } from "react-router-dom"
import { useQuery, useMutation } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Check, ExternalLink } from "lucide-react"

import { getPerfil, updatePerfil } from "@/api/admin/perfil"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"

import { IdentidadeTab } from "@/components/personalizar/IdentidadeTab"
import { HeroTab } from "@/components/personalizar/HeroTab"
import { PortfolioTab } from "@/components/personalizar/PortfolioTab"
import { ContatoTab } from "@/components/personalizar/ContatoTab"
import { TemaTab } from "@/components/personalizar/TemaTab"

const perfilSchema = z.object({
  logo_url: z.string().url({ message: "URL inválida" }).or(z.literal("")).optional().default(""),
  nome_exibicao: z.string().min(1, { message: "Nome do negócio é obrigatório" }),
  tagline: z.string().optional().default(""),
  nome_profissional: z.string().min(1, { message: "Nome da profissional é obrigatório" }),
  especialidade: z.string().optional().default(""),
  hero_titulo: z.string().optional().default(""),
  hero_titulo_destaque: z.string().optional().default(""),
  hero_subtitulo: z.string().optional().default(""),
  banner_titulo: z.string().optional().default(""),
  banner_subtitulo: z.string().optional().default(""),
  endereco: z.string().optional().default(""),
  instagram: z.string().optional().default(""),
  whatsapp: z.string().optional().default(""),
  cor_principal: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, { message: "Cor inválida. Use o formato #RRGGBB" })
    .default("#D4788A"),
  cor_secundaria: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, { message: "Cor inválida. Use o formato #RRGGBB" })
    .default("#F2C4CE"),
})

export type PerfilFormValues = z.infer<typeof perfilSchema>

export function PersonalizarPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data, isLoading } = useQuery({
    queryKey: ["perfil", slug],
    queryFn: () => getPerfil(slug!),
    enabled: !!slug,
  })

  const form = useForm<PerfilFormValues>({
    resolver: zodResolver(perfilSchema),
    defaultValues: {
      logo_url: "",
      nome_exibicao: "",
      tagline: "",
      nome_profissional: "",
      especialidade: "",
      hero_titulo: "",
      hero_titulo_destaque: "",
      hero_subtitulo: "",
      banner_titulo: "",
      banner_subtitulo: "",
      endereco: "",
      instagram: "",
      whatsapp: "",
      cor_principal: "#D4788A",
      cor_secundaria: "#F2C4CE",
    },
  })

  useEffect(() => {
    if (data) {
      form.reset({
        logo_url: data.logo_url ?? "",
        nome_exibicao: data.nome_exibicao ?? "",
        tagline: data.tagline ?? "",
        nome_profissional: data.nome_profissional ?? "",
        especialidade: data.especialidade ?? "",
        hero_titulo: data.hero_titulo ?? "",
        hero_titulo_destaque: data.hero_titulo_destaque ?? "",
        hero_subtitulo: data.hero_subtitulo ?? "",
        banner_titulo: data.banner_titulo ?? "",
        banner_subtitulo: data.banner_subtitulo ?? "",
        endereco: data.endereco ?? "",
        instagram: data.instagram ?? "",
        whatsapp: data.whatsapp ?? "",
        cor_principal: data.cor_principal ?? "#D4788A",
        cor_secundaria: data.cor_secundaria ?? "#F2C4CE",
      })
    }
  }, [data, form])

  const { mutate: publicar, isPending } = useMutation({
    mutationFn: (values: PerfilFormValues) => updatePerfil(slug!, values),
    onSuccess: () => toast.success("Página publicada com sucesso!"),
    onError: () => toast.error("Erro ao publicar. Tente novamente."),
  })

  const onSubmit = (values: PerfilFormValues) => publicar(values)

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          {isLoading ? (
            <>
              <Skeleton className="h-8 w-52 mb-1" />
              <Skeleton className="h-4 w-44" />
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold font-playfair text-foreground">Personalizar página</h1>
              <a
                href={`${window.location.origin}/${slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-0.5"
              >
                URL pública: {window.location.host}/{slug}
                <ExternalLink className="h-3 w-3" />
              </a>
            </>
          )}
        </div>
        <Button
          onClick={form.handleSubmit(onSubmit)}
          disabled={isPending || isLoading}
          className="rounded-full gap-2 shrink-0"
        >
          <Check className="h-4 w-4" />
          {isPending ? "Publicando..." : "Publicar"}
        </Button>
      </div>

      {/* Tabs */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Tabs defaultValue="identidade">
            <TabsList className="mb-6 bg-transparent border-b-2 border-border rounded-none w-full justify-start gap-1 h-auto px-0 pb-0 pt-0 max-w-2xl" >
              {(["identidade", "hero", "portfolio", "contato", "tema"] as const).map((tab) => (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className="rounded-md px-4 py-1.5 mb-1.5 text-sm font-medium text-muted-foreground bg-transparent shadow-none border-0 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none"
                >
                  {tab === "identidade" && "Identidade"}
                  {tab === "hero" && "Hero"}
                  {tab === "portfolio" && "Portfólio"}
                  {tab === "contato" && "Contato & Redes"}
                  {tab === "tema" && "Tema"}
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="max-w-2xl">
              <TabsContent value="identidade">
                <IdentidadeTab control={form.control} slug={slug ?? ""} />
              </TabsContent>

              <TabsContent value="hero">
                <HeroTab control={form.control} />
              </TabsContent>

              <TabsContent value="portfolio">
                <PortfolioTab />
              </TabsContent>

              <TabsContent value="contato">
                <ContatoTab control={form.control} />
              </TabsContent>

              <TabsContent value="tema">
                <TemaTab control={form.control} />
              </TabsContent>
            </div>
          </Tabs>
        </form>
      </Form>
    </div>
  )
}
