import type { CSSProperties } from "react"
import { cn } from "@/lib/utils"

type Variant = "navbar" | "hero"

interface Props {
  logoUrl?: string
  name: string
  variant?: Variant
  className?: string
}

const variantClasses: Record<Variant, string> = {
  navbar: "w-9 h-9 text-sm font-bold text-white",
  hero: "w-20 h-20 text-3xl font-bold font-playfair border-4 border-white",
}

const fallbackStyles: Record<Variant, CSSProperties> = {
  navbar: { background: "var(--color-primary)" },
  hero: { background: "var(--color-secondary)", color: "var(--color-primary)" },
}

export function ProfileLogo({ logoUrl, name, variant = "navbar", className }: Props) {
  const initial = name[0]?.toUpperCase() ?? "N"
  const base = cn("rounded-full shrink-0 overflow-hidden", variantClasses[variant], className)

  if (logoUrl) {
    return <img src={logoUrl} alt="" className={cn(base, "object-cover")} />
  }

  return (
    <div className={cn(base, "flex items-center justify-center")} style={fallbackStyles[variant]}>
      {initial}
    </div>
  )
}
