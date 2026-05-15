import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useMutation } from "@tanstack/react-query"
import { isAxiosError } from "axios"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { changePassword } from "@/api/admin/auth"

const schema = z
  .object({
    senha_atual: z.string().min(1, "Informe a senha atual"),
    nova_senha: z.string().min(6, "Mínimo 6 caracteres"),
    confirmar_senha: z.string().min(1, "Confirme a nova senha"),
  })
  .refine((d) => d.nova_senha === d.confirmar_senha, {
    message: "As senhas não coincidem",
    path: ["confirmar_senha"],
  })

type FormValues = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function AlterarSenhaDialog({ open, onOpenChange, onSuccess }: Props) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { senha_atual: "", nova_senha: "", confirmar_senha: "" },
  })

  const { mutate, isPending } = useMutation({
    mutationFn: (values: FormValues) =>
      changePassword({ senha_atual: values.senha_atual, nova_senha: values.nova_senha }),
    onSuccess: () => {
      toast.success("Senha alterada com sucesso!")
      form.reset()
      onOpenChange(false)
      onSuccess?.()
    },
    onError: (err) => {
      const msg =
        isAxiosError(err) && err.response?.data?.message
          ? String(err.response.data.message)
          : "Não foi possível alterar a senha."
      form.setError("senha_atual", { message: msg })
    },
  })

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) form.reset(); onOpenChange(o) }}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Alterar senha</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit((v) => mutate(v))} className="space-y-4">
            <FormField
              control={form.control}
              name="senha_atual"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha atual</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} className="bg-white"/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nova_senha"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nova senha</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} className="bg-white"/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmar_senha"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmar nova senha</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} className="bg-white"/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" className="rounded-full" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="rounded-full" disabled={isPending}>
                {isPending ? "Salvando..." : "Alterar senha"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
