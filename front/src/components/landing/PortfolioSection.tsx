interface Props {
  corPrincipal: string
  corSecundaria: string
}

export function PortfolioSection({ corPrincipal, corSecundaria }: Props) {
  const placeholders = [
    `${corPrincipal}cc`,
    `${corPrincipal}99`,
    `${corSecundaria}dd`,
    `${corSecundaria}99`,
    `${corSecundaria}66`,
    `${corSecundaria}33`,
  ]

  return (
    <section
      id="portfolio"
      className="py-20 px-6"
      style={{ backgroundColor: `${corSecundaria}33` }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--color-primary)" }}>
            ✦ Portfólio
          </p>
          <h2 className="text-4xl font-bold font-playfair text-foreground">Trabalhos recentes</h2>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {placeholders.map((color, i) => (
            <div
              key={i}
              className="aspect-[4/3] rounded-2xl"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
