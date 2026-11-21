import { useEffect } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Link, useLocation, useNavigate, useParams } from "react-router-dom"
import { impersonateProfissional, listProfissionais } from "@/api/master/profissionais"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"
import { useAuthStore } from "@/store/authStore"

export function MasterAccessPage() {
  const { slug } = useParams()
  const { user, startImpersonation } = useAuth()
  const { state } = useLocation()
  const returnTo: unknown = state?.returnTo
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const access = useQuery({
    queryKey: ["master-access", user?.id, slug],
    queryFn: async () => {
      const professionals = await listProfissionais()
      const target = professionals.find((professional) => professional.slug === slug)
      if (!target) throw new Error("Profissional não encontrada.")
      const { token } = await impersonateProfissional(target.slug)
      return { target, token }
    },
    enabled: Boolean(slug) && user?.role === "SUPERADMIN",
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
    gcTime: 0,
  })

  useEffect(() => {
    if (!access.data || useAuthStore.getState().user?.role !== "SUPERADMIN") return
    const { target, token } = access.data
    startImpersonation(target, token)
    queryClient.clear()
    const panel = `/admin/${encodeURIComponent(target.slug)}`
    const destination = typeof returnTo === "string" && returnTo.startsWith(`${panel}/`)
      ? returnTo
      : `${panel}/dashboard`
    navigate(destination, { replace: true })
  }, [access.data, navigate, queryClient, returnTo, startImpersonation])

  if (access.isError) {
    return (
      <div className="space-y-3">
        <p role="alert" className="text-sm text-destructive">Não foi possível acessar o painel da profissional.</p>
        <Button variant="outline" asChild>
          <Link to="/master/dashboard" replace>Voltar ao Super Admin</Link>
        </Button>
      </div>
    )
  }

  return <p role="status" className="text-sm text-muted-foreground">Abrindo painel da profissional…</p>
}
