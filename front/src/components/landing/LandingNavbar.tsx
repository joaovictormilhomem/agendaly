import { useState } from "react"
import { Link } from "react-router-dom"
import { CalendarDays, Menu } from "lucide-react"
import type { Perfil } from "@/types/perfil"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/store/authStore"

interface Props {
  perfil: Perfil
  slug: string
}

export function LandingNavbar({ perfil, slug }: Props) {
  const initial = (perfil.nome_profissional || perfil.nome_exibicao)[0]?.toUpperCase() ?? "N"
  const [open, setOpen] = useState(false)
  const { user } = useAuthStore()

  const getLoginLink = () => {
    if (!user) return "/login"
    if (user.role === "SUPERADMIN") return "/master/dashboard"
    return `/admin/${user.slug}/dashboard`
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between border-b border-border px-6 lg:px-12 bg-beige">
      <div className="flex items-center gap-2.5">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
          style={{ background: "var(--color-primary)" }}
        >
          {initial}
        </div>
        <span className="font-semibold text-foreground font-playfair">{perfil.nome_exibicao}</span>
      </div>

      {/* Desktop Menu */}
      <div className="hidden md:flex items-center gap-6">
        <a href="#servicos" className="text-sm text-foreground/80 hover:text-foreground transition-colors">Serviços</a>
        <a href="#contato" className="text-sm text-foreground/80 hover:text-foreground transition-colors">Contato</a>
        <Link
          to={`/${slug}/agendar`}
          className="inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-full text-white"
          style={{ background: "var(--color-primary)" }}
        >
          <CalendarDays className="h-4 w-4" />
          Agendar
        </Link>
        <Link
          to={getLoginLink()}
          className="text-sm font-medium px-4 py-2 rounded-full border border-border text-foreground hover:bg-muted transition-colors"
        >
          Login profissional
        </Link>
      </div>

      {/* Mobile Menu */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild className="md:hidden">
          <Button variant="ghost" size="icon">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-64">
          <div className="flex flex-col gap-4 mt-8 px-5">
            <a
              href="#servicos"
              onClick={() => setOpen(false)}
              className="text-base text-foreground/80 hover:text-foreground transition-colors"
            >
              Serviços
            </a>
            <a
              href="#contato"
              onClick={() => setOpen(false)}
              className="text-base text-foreground/80 hover:text-foreground transition-colors"
            >
              Contato
            </a>
            <Link
              to={`/${slug}/agendar`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-1.5 text-base font-medium px-4 py-2 rounded-full text-white w-fit"
              style={{ background: "var(--color-primary)" }}
            >
              <CalendarDays className="h-4 w-4" />
              Agendar
            </Link>
            <Link
              to={getLoginLink()}
              onClick={() => setOpen(false)}
              className="text-base font-medium px-4 py-2 rounded-full border border-border text-foreground hover:bg-muted transition-colors w-fit"
            >
              Login profissional
            </Link>
          </div>
        </SheetContent>
      </Sheet>
    </nav>
  )
}
