/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  auth: {
    login: typeof routes['auth.login']
    refresh: typeof routes['auth.refresh']
    logout: typeof routes['auth.logout']
  }
  users: {
    store: typeof routes['users.store']
  }
}
