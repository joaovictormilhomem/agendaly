import { Link } from "react-router-dom"
import { CalendarDays, MapPin, Instagram, MessageCircle } from "lucide-react"
import type { Perfil } from "@/types/perfil"

function instagramUrl(handle: string) {
  return `https://instagram.com/${handle.replace(/^@/, "")}`
}

function whatsappUrl(number: string) {
  return `https://wa.me/55${number.replace(/\D/g, "")}`
}

interface Props {
  perfil: Perfil
  slug: string
}

export function HeroSection({ perfil, slug }: Props) {
  const initial = (perfil.nome_profissional || perfil.nome_exibicao)[0]?.toUpperCase() ?? "N"

  return (
    <div className="pt-16">
      {/* Hero */}
      <div className="max-w-6xl mx-auto px-6 lg:px-12 py-16 lg:py-24 grid lg:grid-cols-[1fr_420px] gap-12 lg:gap-20 items-center lg:items-stretch">
        {/* Left — text */}
        <div className="space-y-6 text-center lg:text-left justify-self-center lg:justify-self-start">
          {perfil.especialidade && (
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--color-primary)" }}>
              ✦ {perfil.especialidade}
            </p>
          )}
          <h1 className="text-5xl lg:text-6xl font-playfair text-foreground leading-tight">
            {perfil.hero_titulo}
            {perfil.hero_titulo_destaque && (
              <>
                <br />
                <span style={{ color: "var(--color-primary)", fontStyle: "italic" }}>
                  {perfil.hero_titulo_destaque}
                </span>
              </>
            )}
          </h1>
          {perfil.hero_subtitulo && (
            <p className="text-base text-muted-foreground leading-relaxed max-w-md">
              {perfil.hero_subtitulo}
            </p>
          )}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
            <Link
              to={`/${slug}/agendar`}
              className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-3 rounded-full text-white"
              style={{ background: "var(--color-primary)" }}
            >
              <CalendarDays className="h-4 w-4" />
              Agendar horário
            </Link>
            <a
              href="#portfolio"
              className="inline-flex items-center text-sm font-semibold px-6 py-3 rounded-full border border-border bg-white text-foreground hover:bg-muted transition-colors"
            >
              Ver portfólio
            </a>
          </div>
        </div>

        {/* Right — profile card */}
        <div className="flex justify-center lg:justify-end justify-self-center lg:justify-self-end">
          <div className="w-full max-w-xs rounded-2xl overflow-hidden shadow-md bg-white border border-border/40 flex flex-col">
            {/* Rose header */}
            <div className="h-20" style={{ background: "linear-gradient(145deg, var(--color-primary) 0%, var(--color-secondary) 100%)" }} />
            {/* Overlapping avatar */}
            <div className="flex justify-center -mt-8">
              <div
                className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center text-3xl font-bold font-playfair"
                style={{ background: "var(--color-secondary)", color: "var(--color-primary)" }}
              >
                {initial}
              </div>
            </div>
            {/* Body */}
            <div className="px-6 pb-6 pt-3 text-center space-y-4 flex-1 flex flex-col justify-between">
              <div className="pt-5 pb-5 flex flex-col justify-between items-center gap-6">
                <div>
                  <p className="font-semibold text-foreground">{perfil.nome_profissional}</p>
                  <p className="text-sm text-muted-foreground">{perfil.especialidade}</p>
                </div>
                {(perfil.instagram || perfil.whatsapp) && (
                  <div className="flex gap-2 justify-center flex-wrap">
                    {perfil.instagram && (
                      <a
                        href={instagramUrl(perfil.instagram)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-border text-foreground hover:bg-muted transition-colors"
                      >
                        <Instagram className="h-3.5 w-3.5" />
                        Instagram
                      </a>
                    )}
                    {perfil.whatsapp && (
                      <a
                        href={whatsappUrl(perfil.whatsapp)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-border text-foreground hover:bg-muted transition-colors"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        Whatsapp
                      </a>
                    )}
                  </div>
                )}
              </div>
              {perfil.endereco && (
                <div>
                  <hr className="border-border" />
                  <div className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground pt-5">
                    <MapPin className="h-4 w-4 shrink-0" style={{ color: "var(--color-primary)" }} />
                    {perfil.endereco}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
