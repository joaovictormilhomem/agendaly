import { Lock } from "lucide-react"

export function PortfolioTab() {
  return (
    <div className="rounded-lg border border-border p-6 bg-card">
      <div className="flex items-start gap-3 mb-4">
        <h2 className="text-base font-semibold font-playfair">Portfólio de fotos</h2>
        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
          Em breve
        </span>
      </div>
      <div className="flex flex-col items-center justify-center py-12 gap-4 rounded-lg border border-dashed border-border bg-muted/30">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted">
          <Lock className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-foreground">Disponível na próxima versão</p>
          <p className="text-xs text-muted-foreground mt-1">
            O portfólio de fotos estará disponível em breve. Fique ligada!
          </p>
        </div>
      </div>
    </div>
  )
}
