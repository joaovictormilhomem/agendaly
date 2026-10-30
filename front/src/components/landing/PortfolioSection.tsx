import type { PortfolioImagem } from "@/types/portfolio"
export function PortfolioSection({ imagens }: { imagens: PortfolioImagem[] }) {
  if (!imagens.length) return null
  const larguraDesktop = imagens.length === 2
    ? "sm:w-[calc((100%-0.75rem)/2)]"
    : imagens.length === 5 || imagens.length === 6
      ? "sm:w-[calc((100%-1.5rem)/3)]"
      : "sm:w-[calc((100%-2.25rem)/4)]"
  return <section id="portfolio" className="bg-beige px-6 py-20"><div className="mx-auto max-w-6xl px-12"><div className="mb-12"><p className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: "var(--color-primary)" }}>✦ Portfólio</p><h2 className="font-playfair text-4xl font-bold text-foreground">Trabalhos realizados</h2></div><div className="flex flex-wrap justify-center gap-3">{imagens.map((imagem) => <img key={imagem.id} src={imagem.url} alt="Trabalho realizado" className={`aspect-square w-[calc(50%-0.375rem)] rounded-xl object-cover shadow-sm ${larguraDesktop}`} loading="lazy" />)}</div></div></section>
}
