import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useMutation } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { Check, CalendarHeart, UserCircle, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { loginUser } from "@/api/auth"
import { useAuth } from "@/hooks/useAuth"

const schema = z.object({
  email: z.string().min(1, "E-mail obrigatório"),
  senha: z.string().min(1, "Senha obrigatória"),
})
type FormValues = z.infer<typeof schema>

const features = [
  "Agenda completa diária e semanal",
  "Notificações automáticas",
  "Gestão de serviços e disponibilidade",
]

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const mutation = useMutation({
    mutationFn: loginUser,
    onSuccess: ({ token, user }) => {
      login(token, user)
      if (user.role === "SUPERADMIN") {
        navigate("/master/dashboard")
      } else {
        navigate(`/admin/${user.slug}/dashboard`)
      }
    },
    onError: () => {
      toast.error("Credenciais inválidas.", { description: "Verifique seu e-mail e senha e tente novamente." })
    },
  })

  function onSubmit(data: FormValues) {
    mutation.mutate(data)
  }

  return (
    <div className="flex min-h-screen">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-center w-[440px] shrink-0 p-12 relative overflow-hidden"
        style={{ background: "linear-gradient(145deg, #C05C6E 0%, #D57C8D 50%, #E09AAA 100%)" }}>
        {/* Decorative circles */}
        <div className="absolute top-[-80px] right-[-80px] w-64 h-64 rounded-full bg-white/10" />
        <div className="absolute bottom-[-60px] left-[-60px] w-48 h-48 rounded-full bg-white/10" />

        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 text-white shrink-0">
              <CalendarHeart className="h-5 w-5" />
            </div>
            <span className="text-white font-medium text-xl font-playfair">Agendaly</span>
          </div>

          <h1 className="text-white text-4xl font-bold leading-tight mb-5 font-playfair">
            Gerencie sua agenda<br />com praticidade
          </h1>
          <p className="text-white/80 text-base leading-relaxed mb-10 f">
            Acesse seu painel para visualizar agendamentos, gerenciar serviços e personalizar sua página.
          </p>

          <ul className="space-y-4">
            {features.map((f) => (
              <li key={f} className="flex items-center gap-3 text-white/90 text-base">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white/20 shrink-0">
                  <Check className="h-3.5 w-3.5 text-white" />
                </div>
                {f}
              </li>
            ))}
          </ul>

          <p className="text-white/40 text-xs mt-16">© 2026 Agendaly</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 items-center justify-center px-6 py-10 bg-background">
        <div className="w-full max-w-sm">
          <div className="mb-6">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-primary mb-4">
              <UserCircle className="h-4 w-4" />
              Acesso Profissional
            </span>
            <h2 className="text-2xl font-bold text-foreground font-playfair">Bem-vinda de volta</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Entre na sua conta para gerenciar sua agenda
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="profissional@email.com"
                autoComplete="email"
                className="bg-white"
                aria-invalid={!!errors.email}
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="senha">Senha</Label>
              <div className="relative">
                <Input
                  id="senha"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  className="pr-10 bg-white"
                  placeholder="Digite sua senha"
                  aria-invalid={!!errors.senha}
                  {...register("senha")}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.senha && (
                <p className="text-xs text-destructive">{errors.senha.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full mt-2 rounded-full"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Entrando..." : "Entrar no painel"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
