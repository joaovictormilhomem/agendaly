import type { CSSProperties } from "react"
import { useParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { Skeleton } from "@/components/ui/skeleton"

import { getPerfilPublico } from "@/api/public/perfil"
import { getServicosPublicos } from "@/api/public/servicos"
import { LandingNavbar } from "@/components/landing/LandingNavbar"
import { HeroSection } from "@/components/landing/HeroSection"
import { ServicosSection } from "@/components/landing/ServicosSection"
import { BannerSection } from "@/components/landing/BannerSection"
import { ContatoFooter } from "@/components/landing/ContatoFooter"

function LandingPageSkeleton() {
  return (
    <div>
      <Skeleton className="h-screen w-full rounded-none" />
      <Skeleton className="h-80 w-full rounded-none" />
    </div>
  )
}

export function LandingPage() {
  const { slug } = useParams<{ slug: string }>()

  const { data: perfil, isLoading } = useQuery({
    queryKey: ["perfil-pub", slug],
    queryFn: () => getPerfilPublico(slug!),
    enabled: !!slug,
  })

  const { data: servicos } = useQuery({
    queryKey: ["servicos-pub", slug],
    queryFn: () => getServicosPublicos(slug!),
    enabled: !!slug,
  })

  if (isLoading || !perfil) return <LandingPageSkeleton />

  const activeServicos = (servicos ?? []).filter((s) => s.ativo)

  return (
    <div
      style={
        {
          "--color-primary": perfil.cor_principal,
          "--color-secondary": perfil.cor_secundaria,
        } as CSSProperties
      }
    >
      <LandingNavbar perfil={perfil} slug={slug!} />
      <HeroSection perfil={perfil} slug={slug!} />
      <ServicosSection servicos={activeServicos} slug={slug!} />
      <BannerSection perfil={perfil} slug={slug!} />
      <ContatoFooter perfil={perfil} />
    </div>
  )
}
