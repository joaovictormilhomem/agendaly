import { TicketList } from "@/components/support/TicketList"

export function MasterTicketsPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <h1 className="font-playfair text-3xl font-bold">Chamados de suporte</h1>
      <TicketList staff />
    </div>
  )
}
