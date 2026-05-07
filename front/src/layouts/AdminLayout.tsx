import { Outlet, useParams, useLocation } from "react-router-dom"
import { AdminSidebar } from "@/components/shared/AppSidebar"
import { TopBar } from "@/components/shared/TopBar"
import { ImpersonationBanner } from "@/components/shared/ImpersonationBanner"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

const pageTitles: Record<string, string> = {
  dashboard: "Dashboard",
  agenda: "Agenda",
  servicos: "Serviços",
  disponibilidade: "Disponibilidade",
  personalizar: "Personalizar",
}

export function AdminLayout() {
  const { slug } = useParams<{ slug: string }>()
  const location = useLocation()
  const segment = location.pathname.split("/").pop() ?? "dashboard"
  const title = pageTitles[segment] ?? "Painel"

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
