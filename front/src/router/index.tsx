import { createBrowserRouter, Navigate } from "react-router-dom"
import { ProtectedRoute } from "./ProtectedRoute"
import { AdminLayout } from "@/layouts/AdminLayout"
import { MasterLayout } from "@/layouts/MasterLayout"
import { LoginPage } from "@/pages/auth/LoginPage"
import { MasterDashboardPage } from "@/pages/master/MasterDashboardPage"
import { DashboardPage } from "@/pages/admin/DashboardPage"
import { PersonalizarPage } from "@/pages/admin/PersonalizarPage"

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
    path: "*",
    element: <Navigate to="/login" replace />,
  },
])
