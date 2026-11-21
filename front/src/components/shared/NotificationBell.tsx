import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { isAxiosError } from "axios"
import { Bell, Calendar, Headset } from "lucide-react"
import { Link } from "react-router-dom"
import { getNotifications, markNotificationsRead } from "@/api/admin/notifications"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useAuth } from "@/hooks/useAuth"

const dateFormat = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" })

export function NotificationBell({ slug }: { slug: string }) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const queryKey = ["notifications", user?.id]
  const notifications = useQuery({
    queryKey,
    queryFn: ({ signal }) => getNotifications(signal),
    refetchInterval: (query) => {
      const error = query.state.error
      return isAxiosError(error) && error.response?.status === 401 ? false : 20_000
    },
    retry: false,
  })
  const read = useMutation({
    mutationFn: markNotificationsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  })
  const unread = notifications.data?.unread ?? 0

  return (
    <Popover open={open} onOpenChange={(next) => {
      setOpen(next)
      if (next) {
        read.reset()
        void notifications.refetch()
      }
    }}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative shrink-0 rounded-full"
          aria-label={unread ? `Notificações, ${unread} não lidas` : "Notificações"}
        >
          <Bell className="size-5" />
          {unread > 0 && (
            <span aria-hidden="true" className="absolute right-0 top-0 min-w-4 rounded-full bg-primary px-0.5 text-center text-[10px] leading-4 text-primary-foreground">
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" aria-label="Notificações" className="w-88 max-w-[calc(100vw-2rem)] p-0">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
          <h2 className="font-semibold">Notificações</h2>
          {unread > 0 && (
            <Button size="sm" variant="ghost" disabled={read.isPending} onClick={() => read.mutate(undefined)}>
              Marcar todas como lidas
            </Button>
          )}
        </div>
        {notifications.isPending && <p role="status" className="p-4 text-sm">Carregando notificações…</p>}
        {notifications.isError && (
          <div className="px-4 py-3 text-sm">
            <p role="alert">Não foi possível atualizar as notificações.</p>
            <Button variant="link" className="px-0" onClick={() => notifications.refetch()}>Tentar novamente</Button>
          </div>
        )}
        {read.isError && <p role="alert" className="px-4 py-3 text-sm text-destructive">Não foi possível marcar como lida.</p>}
        {notifications.isSuccess && notifications.data.items.length === 0 && (
          <p className="p-4 text-sm text-muted-foreground">Nenhuma notificação nova.</p>
        )}
        <ul className="max-h-[min(24rem,60vh)] divide-y overflow-y-auto">
          {notifications.data?.items.map((item) => {
            const booking = item.kind === "BOOKING_CREATED"
            const Icon = booking ? Calendar : Headset
            const target = booking ? `agenda?agendamento=${item.target_id}` : `ajuda/${item.target_id}`
            return (
              <li key={item.id}>
                <Link
                  to={`/admin/${slug}/${target}`}
                  className="flex gap-3 bg-primary/5 px-4 py-3 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                  onClick={() => {
                    read.mutate(item.id)
                    setOpen(false)
                  }}
                >
                  <Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="text-sm font-semibold">{booking ? "Novo agendamento" : "Status do chamado atualizado"}</p>
                    <p className="break-words text-sm">{item.description}</p>
                    <time dateTime={item.created_at} className="block text-xs text-muted-foreground">{dateFormat.format(new Date(item.created_at))}</time>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      </PopoverContent>
    </Popover>
  )
}
