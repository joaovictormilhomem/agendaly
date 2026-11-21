import { ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useAuth } from "@/hooks/useAuth"
import { NotificationBell } from "./NotificationBell"

interface TopBarProps {
  title: string
  showViewPage?: boolean
  slug?: string
}

export function TopBar({ title, showViewPage, slug }: TopBarProps) {
  const { user } = useAuth()
  const profileSlug = showViewPage && slug === user?.slug && user?.role === "PROFISSIONAL" ? slug : undefined

  return (
    <header className="flex items-center justify-between h-14 px-4 border-b border-border shrink-0">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden" />
        <span className="font-semibold text-sm">{title}</span>
      </div>
      <div className="flex items-center gap-1 sm:gap-3">
        {showViewPage && slug && (
          <Button variant="outline" size="sm" asChild className="gap-2 rounded-full text-primary border-primary hover:bg-secondary">
            <a href={`/${slug}`} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only">Ver minha página</span>
            </a>
          </Button>
        )}
        {profileSlug && (
          <NotificationBell key={user?.id} slug={profileSlug} />
        )}
      </div>
    </header>
  )
}
