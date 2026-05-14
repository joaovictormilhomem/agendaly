/*
|--------------------------------------------------------------------------
| Environment variables service
|--------------------------------------------------------------------------
|
| The `Env.create` method creates an instance of the Env service. The
| service validates the environment variables and also cast values
| to JavaScript data types.
|
*/

import { Env } from '@adonisjs/core/env'

export default await Env.create(new URL('../', import.meta.url), {
  // Node
  NODE_ENV: Env.schema.enum(['development', 'production', 'test'] as const),
  PORT: Env.schema.number(),
  HOST: Env.schema.string({ format: 'host' }),
  LOG_LEVEL: Env.schema.string(),

  // App
  APP_KEY: Env.schema.secret(),
  APP_URL: Env.schema.string({ format: 'url', tld: false }),

  // Database
  DB_CONNECTION: Env.schema.enum(['pg'] as const),
  DB_HOST: Env.schema.string.optional({ format: 'host' }),
  DB_PORT: Env.schema.number.optional(),
  DB_USER: Env.schema.string.optional(),
  DB_PASSWORD: Env.schema.string.optional(),
  DB_DATABASE: Env.schema.string.optional(),

  // Auth (JWT)
  JWT_ACCESS_SECRET: Env.schema.secret(),
  JWT_REFRESH_SECRET: Env.schema.secret(),

  // Session
  SESSION_DRIVER: Env.schema.enum(['cookie', 'memory', 'database'] as const),

  /** URL do serviço whatsapp-worker (ex.: http://127.0.0.1:3334). Se vazio, notificações WA ficam desligadas. */
  WHATSAPP_BRIDGE_URL: Env.schema.string.optional({ format: 'url', tld: false }),
  /** Mesmo valor que WHATSAPP_BRIDGE_SECRET no worker (Bearer). */
  WHATSAPP_BRIDGE_SECRET: Env.schema.string.optional(),
})
