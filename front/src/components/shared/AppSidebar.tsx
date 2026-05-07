import { Link, useLocation, useParams } from "react-router-dom"
import { LayoutDashboard, Calendar, Scissors, Clock, Settings, LogOut, CalendarHeart } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
} from "@/components/ui/sidebar"
import { useAuth } from "@/hooks/useAuth"

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
}

interface AppSidebarProps {
  navItems: NavItem[]
  businessName: string
  businessTagline?: string
  initial?: string
}

export function AppSidebar({ navItems, businessName, businessTagline, initial }: AppSidebarProps) {
  const location = useLocation()
  const { logout } = useAuth()

  return (
    <Sidebar collapsible="offcanvas" className="min-h-svh border-r">
      <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary text-primary-foreground shrink-0">
            {initial ? (
              <span className="text-base font-bold font-playfair">{initial}</span>
            ) : (
              <CalendarHeart className="h-4 w-4" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-sidebar-foreground truncate">{businessName}</p>
            {businessTagline && (
              <p className="text-xs text-muted-foreground truncate">{businessTagline}</p>
            )}
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarMenu>
            {navItems.map((item) => {
              const active = location.pathname.startsWith(item.href)
              const Icon = item.icon
              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={active}>
                    <Link to={item.href}>
                      <Icon />
                      {item.label}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={logout} className="text-muted-foreground hover:text-foreground">
              <LogOut />
              Sair
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

export function AdminSidebar() {
  const { slug } = useParams<{ slug: string }>()
  const { user } = useAuth()
  const base = `/admin/${slug}`

  const navItems = [
    { label: "Dashboard", href: `${base}/dashboard`, icon: LayoutDashboard },
    { label: "Agenda", href: `${base}/agenda`, icon: Calendar },
    { label: "Serviços", href: `${base}/servicos`, icon: Scissors },
    { label: "Disponibilidade", href: `${base}/disponibilidade`, icon: Clock },
    { label: "Personalizar", href: `${base}/personalizar`, icon: Settings },
  ]

  return (
    <AppSidebar
      navItems={navItems}
      businessName={user?.nome ?? "Painel"}
      businessTagline="Painel Admin"
    />
  )
}

export function MasterSidebar() {
  const navItems = [
    { label: "Dashboard", href: "/master/dashboard", icon: LayoutDashboard },
  ]
  return (
    <AppSidebar
      navItems={navItems}
      businessName="Agendaly"
      businessTagline="Super Admin"
      initial="A"
    />
  )
}
