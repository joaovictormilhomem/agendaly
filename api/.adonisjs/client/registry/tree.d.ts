/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  auth: {
    login: typeof routes['auth.login']
    refresh: typeof routes['auth.refresh']
    logout: typeof routes['auth.logout']
  }
  users: {
    index: typeof routes['users.index']
    impersonate: typeof routes['users.impersonate']
    store: typeof routes['users.store']
  }
}
