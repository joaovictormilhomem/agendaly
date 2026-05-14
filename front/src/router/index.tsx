import { createBrowserRouter, Navigate } from "react-router-dom"
import { ProtectedRoute } from "./ProtectedRoute"
import { AdminLayout } from "@/layouts/AdminLayout"
import { MasterLayout } from "@/layouts/MasterLayout"
import { LoginPage } from "@/pages/auth/LoginPage"
import { MasterDashboardPage } from "@/pages/master/MasterDashboardPage"
import { DashboardPage } from "@/pages/admin/DashboardPage"
import { AgendaPage } from "@/pages/admin/AgendaPage"
import { PersonalizarPage } from "@/pages/admin/PersonalizarPage"
import { ServicosPage } from "@/pages/admin/ServicosPage"
import { DisponibilidadePage } from "@/pages/admin/DisponibilidadePage"
import { WhatsappPage } from "@/pages/admin/WhatsappPage"
import { LandingPage } from "@/pages/public/LandingPage"
import { AgendarPage } from "@/pages/public/AgendarPage"

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    element: <ProtectedRoute requiredRole="SUPERADMIN" />,
    children: [
      {
        path: "/master",
        element: <MasterLayout />,
        children: [
          { index: true, element: <Navigate to="/master/dashboard" replace /> },
          { path: "dashboard", element: <MasterDashboardPage /> },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/admin/:slug",
        element: <AdminLayout />,
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: "dashboard", element: <DashboardPage /> },
          { path: "agenda", element: <AgendaPage /> },
          { path: "servicos", element: <ServicosPage /> },
          { path: "disponibilidade", element: <DisponibilidadePage /> },
          { path: "whatsapp", element: <WhatsappPage /> },
          { path: "personalizar", element: <PersonalizarPage /> },
        ],
      },
    ],
  },
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: ":slug",
    element: <LandingPage />,
  },
  {
    path: ":slug/agendar",
    element: <AgendarPage />,
  },
  {
    path: "*",
    element: <Navigate to="/login" replace />,
  },
])
