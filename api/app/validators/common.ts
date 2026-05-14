import vine from '@vinejs/vine'

/**
 * Formato UUID do Postgres (32 hex + hífens). Não exige versão RFC 4122 — o Vine `uuid()`
 * rejeita IDs como `a0000000-0000-0000-0000-...` usados em seeds/demos.
 */
export const UUID_LIKE_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function vineUuidLike() {
  return vine.string().trim().regex(UUID_LIKE_PATTERN)
}
