import { ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"

interface TopBarProps {
  title: string
  showViewPage?: boolean
  slug?: string
}

export function TopBar({ title, showViewPage, slug }: TopBarProps) {
  return (
    <header className="flex items-center justify-between h-14 px-4 border-b border-border shrink-0">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden" />
        <span className="font-semibold text-sm">{title}</span>
      </div>
      {showViewPage && slug && (
        <Button variant="outline" size="sm" asChild className="gap-2 rounded-full text-primary border-primary hover:bg-secondary">
          <a href={`/${slug}`} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-3.5 w-3.5" />
            Ver minha página
          </a>
        </Button>
      )}
    </header>
  )
}
