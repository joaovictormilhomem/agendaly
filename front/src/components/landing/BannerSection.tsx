import { Link } from "react-router-dom"
import { CalendarDays } from "lucide-react"
import type { Perfil } from "@/types/perfil"

interface Props {
  perfil: Perfil
  slug: string
}

export function BannerSection({ perfil, slug }: Props) {
  return (
    <section
      className="py-12 px-6"
    >
      <div
        className="max-w-3xl mx-auto rounded-2xl py-14 px-8 text-center space-y-4"
        style={{ background: "linear-gradient(145deg, #C05C6E 0%, #D57C8D 50%, #E09AAA 100%)" }}
      >
        {perfil.banner_titulo && (
          <h2 className="text-3xl sm:text-4xl font-bold font-playfair text-white">
            {perfil.banner_titulo}
          </h2>
        )}
        {perfil.banner_subtitulo && (
          <p className="text-white/80 text-sm">{perfil.banner_subtitulo}</p>
        )}
        <div className="pt-2">
          <Link
            to={`/${slug}/agendar`}
            className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-3 rounded-full bg-white transition-opacity hover:opacity-90"
            style={{ color: "var(--color-primary)" }}
          >
            <CalendarDays className="h-4 w-4" />
            Agendar agora
          </Link>
        </div>
      </div>
    </section>
  )
}
