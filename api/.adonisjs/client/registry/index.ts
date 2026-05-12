/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

const placeholder: any = {}

const routes = {
  'auth.login': {
    methods: ["POST"],
    pattern: '/api/login',
    tokens: [{"old":"/api/login","type":0,"val":"api","end":""},{"old":"/api/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['auth.login']['types'],
  },
  'auth.refresh': {
    methods: ["POST"],
    pattern: '/api/refresh',
    tokens: [{"old":"/api/refresh","type":0,"val":"api","end":""},{"old":"/api/refresh","type":0,"val":"refresh","end":""}],
    types: placeholder as Registry['auth.refresh']['types'],
  },
  'auth.logout': {
    methods: ["POST"],
    pattern: '/api/logout',
    tokens: [{"old":"/api/logout","type":0,"val":"api","end":""},{"old":"/api/logout","type":0,"val":"logout","end":""}],
    types: placeholder as Registry['auth.logout']['types'],
  },
  'users.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/users',
    tokens: [{"old":"/api/users","type":0,"val":"api","end":""},{"old":"/api/users","type":0,"val":"users","end":""}],
    types: placeholder as Registry['users.index']['types'],
  },
  'users.impersonate': {
    methods: ["POST"],
    pattern: '/api/users/impersonate/:slug',
    tokens: [{"old":"/api/users/impersonate/:slug","type":0,"val":"api","end":""},{"old":"/api/users/impersonate/:slug","type":0,"val":"users","end":""},{"old":"/api/users/impersonate/:slug","type":0,"val":"impersonate","end":""},{"old":"/api/users/impersonate/:slug","type":1,"val":"slug","end":""}],
    types: placeholder as Registry['users.impersonate']['types'],
  },
  'users.store': {
    methods: ["POST"],
    pattern: '/api/users',
    tokens: [{"old":"/api/users","type":0,"val":"api","end":""},{"old":"/api/users","type":0,"val":"users","end":""}],
    types: placeholder as Registry['users.store']['types'],
  },
  'profile.public_show': {
    methods: ["GET","HEAD"],
    pattern: '/api/public/:slug/perfil',
    tokens: [{"old":"/api/public/:slug/perfil","type":0,"val":"api","end":""},{"old":"/api/public/:slug/perfil","type":0,"val":"public","end":""},{"old":"/api/public/:slug/perfil","type":1,"val":"slug","end":""},{"old":"/api/public/:slug/perfil","type":0,"val":"perfil","end":""}],
    types: placeholder as Registry['profile.public_show']['types'],
  },
  'profile.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/admin/:slug/perfil',
    tokens: [{"old":"/api/admin/:slug/perfil","type":0,"val":"api","end":""},{"old":"/api/admin/:slug/perfil","type":0,"val":"admin","end":""},{"old":"/api/admin/:slug/perfil","type":1,"val":"slug","end":""},{"old":"/api/admin/:slug/perfil","type":0,"val":"perfil","end":""}],
    types: placeholder as Registry['profile.show']['types'],
  },
  'profile.update': {
    methods: ["PUT"],
    pattern: '/api/admin/:slug/perfil',
    tokens: [{"old":"/api/admin/:slug/perfil","type":0,"val":"api","end":""},{"old":"/api/admin/:slug/perfil","type":0,"val":"admin","end":""},{"old":"/api/admin/:slug/perfil","type":1,"val":"slug","end":""},{"old":"/api/admin/:slug/perfil","type":0,"val":"perfil","end":""}],
    types: placeholder as Registry['profile.update']['types'],
  },
  'servicos.public_index': {
    methods: ["GET","HEAD"],
    pattern: '/api/public/:slug/servicos',
    tokens: [{"old":"/api/public/:slug/servicos","type":0,"val":"api","end":""},{"old":"/api/public/:slug/servicos","type":0,"val":"public","end":""},{"old":"/api/public/:slug/servicos","type":1,"val":"slug","end":""},{"old":"/api/public/:slug/servicos","type":0,"val":"servicos","end":""}],
    types: placeholder as Registry['servicos.public_index']['types'],
  },
  'servicos.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/admin/:slug/servicos',
    tokens: [{"old":"/api/admin/:slug/servicos","type":0,"val":"api","end":""},{"old":"/api/admin/:slug/servicos","type":0,"val":"admin","end":""},{"old":"/api/admin/:slug/servicos","type":1,"val":"slug","end":""},{"old":"/api/admin/:slug/servicos","type":0,"val":"servicos","end":""}],
    types: placeholder as Registry['servicos.index']['types'],
  },
  'servicos.store': {
    methods: ["POST"],
    pattern: '/api/admin/:slug/servicos',
    tokens: [{"old":"/api/admin/:slug/servicos","type":0,"val":"api","end":""},{"old":"/api/admin/:slug/servicos","type":0,"val":"admin","end":""},{"old":"/api/admin/:slug/servicos","type":1,"val":"slug","end":""},{"old":"/api/admin/:slug/servicos","type":0,"val":"servicos","end":""}],
    types: placeholder as Registry['servicos.store']['types'],
  },
  'servicos.update': {
    methods: ["PUT"],
    pattern: '/api/admin/:slug/servicos/:id',
    tokens: [{"old":"/api/admin/:slug/servicos/:id","type":0,"val":"api","end":""},{"old":"/api/admin/:slug/servicos/:id","type":0,"val":"admin","end":""},{"old":"/api/admin/:slug/servicos/:id","type":1,"val":"slug","end":""},{"old":"/api/admin/:slug/servicos/:id","type":0,"val":"servicos","end":""},{"old":"/api/admin/:slug/servicos/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['servicos.update']['types'],
  },
  'servicos.destroy': {
    methods: ["DELETE"],
    pattern: '/api/admin/:slug/servicos/:id',
    tokens: [{"old":"/api/admin/:slug/servicos/:id","type":0,"val":"api","end":""},{"old":"/api/admin/:slug/servicos/:id","type":0,"val":"admin","end":""},{"old":"/api/admin/:slug/servicos/:id","type":1,"val":"slug","end":""},{"old":"/api/admin/:slug/servicos/:id","type":0,"val":"servicos","end":""},{"old":"/api/admin/:slug/servicos/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['servicos.destroy']['types'],
  },
} as const satisfies Record<string, AdonisEndpoint>

export { routes }

export const registry = {
  routes,
  $tree: {} as ApiDefinition,
}

declare module '@tuyau/core/types' {
  export interface UserRegistry {
    routes: typeof routes
    $tree: ApiDefinition
  }
}
