import { ticketStatuses, type TicketStatus } from "@/api/support"
import { Badge } from "@/components/ui/badge"

const statusColors: Record<TicketStatus, string> = {
  OPEN: "bg-blue-100 text-blue-800",
  IN_PROGRESS: "bg-violet-100 text-violet-800",
  WAITING_CUSTOMER: "bg-amber-100 text-amber-900",
  RESOLVED: "bg-emerald-100 text-emerald-800",
}

export function TicketStatusBadge({ status }: { status: TicketStatus }) {
  return (
    <Badge variant="ghost" className={statusColors[status]}>
      {ticketStatuses[status]}
    </Badge>
  )
}
