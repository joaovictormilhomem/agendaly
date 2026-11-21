import { Navigate, Outlet, useParams, useLocation } from "react-router-dom"
import { AdminSidebar } from "@/components/shared/AppSidebar"
import { TopBar } from "@/components/shared/TopBar"
import { ImpersonationBanner } from "@/components/shared/ImpersonationBanner"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { useAuth } from "@/hooks/useAuth"

const pageTitles: Record<string, string> = {
  dashboard: "Dashboard",
  agenda: "Agenda",
  servicos: "Serviços",
  disponibilidade: "Disponibilidade",
  whatsapp: "WhatsApp",
  personalizar: "Personalizar",
  ajuda: "Ajuda e suporte",
}

export function AdminLayout() {
  const { slug } = useParams<{ slug: string }>()
  const location = useLocation()
  const { isSuperAdmin } = useAuth()
  const segment = location.pathname.split("/")[3] ?? "dashboard"
  const title = pageTitles[segment] ?? "Painel"

  if (slug && isSuperAdmin) {
    return (
      <Navigate
        to={`/master/acessar/${encodeURIComponent(slug)}`}
        state={{ returnTo: location.pathname + location.search + location.hash }}
        replace
      />
    )
  }

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <ImpersonationBanner />
        <TopBar title={title} showViewPage slug={slug} />
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
