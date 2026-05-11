import { Instagram, MessageCircle } from "lucide-react"
import type { Perfil } from "@/types/perfil"

interface Props {
  perfil: Perfil
}

function instagramUrl(handle: string) {
  return `https://instagram.com/${handle.replace(/^@/, "")}`
}

function whatsappUrl(number: string) {
  return `https://wa.me/55${number.replace(/\D/g, "")}`
}

export function ContatoFooter({ perfil }: Props) {
  return (
    <footer id="contato" className="py-10 px-6 bg-white border-t border-border text-center">
      <p className="text-lg font-semibold font-playfair text-foreground">{perfil.nome_exibicao}</p>
      {perfil.endereco && (
        <p className="text-sm text-muted-foreground mt-1">
          {perfil.endereco}
          {perfil.tagline ? ` — ${perfil.tagline}` : ""}
        </p>
      )}
      {(perfil.instagram || perfil.whatsapp) && (
        <div className="flex gap-3 justify-center mt-5">
          {perfil.instagram && (
            <a
              href={instagramUrl(perfil.instagram)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm px-4 py-1.5 rounded-full border border-border text-foreground hover:bg-muted transition-colors"
            >
              <Instagram className="h-4 w-4" />
              Instagram
            </a>
          )}
          {perfil.whatsapp && (
            <a
              href={whatsappUrl(perfil.whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm px-4 py-1.5 rounded-full border border-border text-foreground hover:bg-muted transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              Whatsapp
            </a>
          )}
        </div>
      )}
    </footer>
  )
}
