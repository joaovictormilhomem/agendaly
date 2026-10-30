export type WhatsappMensagemContexto = "agendamento_criado" | "confirmado_admin" | "cancelado"
export type WhatsappMensagemStatus = "pendente" | "enviado" | "falhou"

export interface WhatsappMensagem {
  id: string
  agendamento_id: string
  cliente_nome: string
  contexto: WhatsappMensagemContexto
  destinatario: string
  corpo: string
  status: WhatsappMensagemStatus
  erro: string | null
  chat_id: string | null
  message_id: string | null
  created_at: string
  updated_at: string | null
}

export interface WhatsappMensagensResponse {
  mensagens: WhatsappMensagem[]
  meta: {
    total: number
    page: number
    per_page: number
    last_page: number
  }
}
