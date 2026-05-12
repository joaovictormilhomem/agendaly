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
  profile: {
    publicShow: typeof routes['profile.public_show']
    show: typeof routes['profile.show']
    update: typeof routes['profile.update']
  }
  servicos: {
    publicIndex: typeof routes['servicos.public_index']
    index: typeof routes['servicos.index']
    store: typeof routes['servicos.store']
    update: typeof routes['servicos.update']
    destroy: typeof routes['servicos.destroy']
  }
  disponibilidade: {
    show: typeof routes['disponibilidade.show']
    update: typeof routes['disponibilidade.update']
  }
}
