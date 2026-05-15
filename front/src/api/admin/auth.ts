import { apiClient } from "@/api/client"

export async function changePassword(body: { senha_atual: string; nova_senha: string }): Promise<void> {
  await apiClient.patch("/api/me/senha", body)
}
