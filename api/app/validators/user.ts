import vine from '@vinejs/vine'

/**
 * Shared rules for email and password.
 */
const email = () => vine.string().email().maxLength(254)
const password = () => vine.string().minLength(8).maxLength(72)

/**
 * Validator to use when a SUPERADMIN creates users
 */
export const createUserValidator = vine.compile(
  vine.object({
    name: vine.string().minLength(2).maxLength(150),
    email: email().unique({ table: 'users', column: 'email' }),
    password: password(),
    slug: vine.string().minLength(2).maxLength(50).unique({ table: 'users', column: 'slug' }),
    role: vine.enum(['SUPERADMIN', 'PROFISSIONAL'] as const),
  })
)

/**
 * Validator to use before validating user credentials
 * during login
 */
export const loginValidator = vine.create({
  email: email(),
  password: vine.string(),
})
