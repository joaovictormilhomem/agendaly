import { Outlet, useLocation } from "react-router-dom"
import { MasterSidebar } from "@/components/shared/AppSidebar"
import { TopBar } from "@/components/shared/TopBar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

const pageTitles: Record<string, string> = {
  dashboard: "Dashboard",
}

export function MasterLayout() {
  const location = useLocation()
  const segment = location.pathname.split("/").pop() ?? "dashboard"
  const title = pageTitles[segment] ?? "Master"

  return (
    <SidebarProvider>
      <MasterSidebar />
      <SidebarInset>
        <TopBar title={title} />
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
