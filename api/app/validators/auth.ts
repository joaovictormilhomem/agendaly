import vine from '@vinejs/vine'

export const loginValidator = vine.compile(
  vine.object({
    email: vine.string().email(),
    password: vine.string().minLength(6),
  })
)

export const refreshValidator = vine.compile(
  vine.object({
    refresh_token: vine.string(),
  })
)

export const logoutValidator = vine.compile(
  vine.object({
    refresh_token: vine.string().optional(),
  })
)

export const changePasswordValidator = vine.compile(
  vine.object({
    senha_atual: vine.string(),
    nova_senha: vine.string().minLength(6),
  })
)

