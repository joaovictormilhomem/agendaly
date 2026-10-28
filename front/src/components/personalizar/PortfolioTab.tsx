import { ImagePlus, Trash2 } from "lucide-react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { excluirImagemPortfolio, getPortfolio, uploadImagemPortfolio } from "@/api/admin/portfolio"

export function PortfolioTab({ slug }: { slug: string }) {
  const qc = useQueryClient()
  const { data: imagens = [], isLoading } = useQuery({ queryKey: ["portfolio", slug], queryFn: () => getPortfolio(slug), enabled: !!slug })
  const upload = useMutation({ mutationFn: (arquivo: File) => uploadImagemPortfolio(slug, arquivo), onSuccess: () => { qc.invalidateQueries({ queryKey: ["portfolio", slug] }); toast.success("Imagem adicionada ao portfólio.") }, onError: () => toast.error("Use JPG, PNG ou WebP com até 5 MB.") })
  const excluir = useMutation({ mutationFn: (id: string) => excluirImagemPortfolio(slug, id), onSuccess: () => { qc.invalidateQueries({ queryKey: ["portfolio", slug] }); toast.success("Imagem removida.") } })
  return <div className="rounded-lg border border-border bg-card p-6"><h2 className="mb-2 text-base font-semibold font-playfair">Portfólio de fotos</h2><p className="mb-4 text-sm text-muted-foreground">Envie até 8 imagens JPG, PNG ou WebP de até 5 MB. Elas aparecem quadradas na página pública.</p><div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{imagens.map((imagem) => <div key={imagem.id} className="group relative aspect-square overflow-hidden rounded-lg border border-border"><img src={imagem.url} alt="Portfólio" className="h-full w-full object-cover" /><Button type="button" size="icon" variant="destructive" className="absolute right-2 top-2 h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100" onClick={() => excluir.mutate(imagem.id)} aria-label="Remover imagem"><Trash2 className="h-4 w-4" /></Button></div>)}{imagens.length < 8 && <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 text-center hover:bg-muted/50"><ImagePlus className="h-6 w-6 text-muted-foreground" /><span className="text-xs text-muted-foreground">{upload.isPending ? "Enviando..." : "Adicionar foto"}</span><input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={upload.isPending || isLoading} onChange={(event) => { const arquivo = event.target.files?.[0]; if (arquivo) upload.mutate(arquivo); event.currentTarget.value = "" }} /></label>}</div></div>
}
