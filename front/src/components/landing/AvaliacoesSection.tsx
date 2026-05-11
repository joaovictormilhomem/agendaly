interface Props {
  corSecundaria: string
}

const REVIEWS = [
  {
    text: "Trabalho impecável! Minhas unhas ficaram lindas e duradouras.",
    author: "Ana Paula",
  },
  {
    text: "Profissional incrível e atenciosa.",
    author: "Carla M.",
  },
  {
    text: "Já indiquei pra todas minhas amigas, profissional maravilhosa!",
    author: "Jéssica O.",
  },
]

export function AvaliacoesSection({ corSecundaria }: Props) {
  return (
    <section
      className="py-20 px-6"
      style={{ backgroundColor: `${corSecundaria}33` }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--color-primary)" }}>
            ✦ Avaliações
          </p>
          <h2 className="text-4xl font-bold font-playfair text-foreground">O que dizem os clientes</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {REVIEWS.map((review) => (
            <div key={review.author} className="bg-white rounded-2xl p-6 space-y-3 border border-border/40">
              <p className="text-yellow-400 text-base">★★★★★</p>
              <p className="text-sm text-foreground/80 leading-relaxed">"{review.text}"</p>
              <p className="text-sm font-semibold text-foreground">{review.author}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
