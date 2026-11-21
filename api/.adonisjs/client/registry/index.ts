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
  'auth.change_password': {
    methods: ["PATCH"],
    pattern: '/api/me/senha',
    tokens: [{"old":"/api/me/senha","type":0,"val":"api","end":""},{"old":"/api/me/senha","type":0,"val":"me","end":""},{"old":"/api/me/senha","type":0,"val":"senha","end":""}],
    types: placeholder as Registry['auth.change_password']['types'],
  },
  'user_notifications.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/me/notifications',
    tokens: [{"old":"/api/me/notifications","type":0,"val":"api","end":""},{"old":"/api/me/notifications","type":0,"val":"me","end":""},{"old":"/api/me/notifications","type":0,"val":"notifications","end":""}],
    types: placeholder as Registry['user_notifications.index']['types'],
  },
  'user_notifications.read': {
    methods: ["PATCH"],
    pattern: '/api/me/notifications/read',
    tokens: [{"old":"/api/me/notifications/read","type":0,"val":"api","end":""},{"old":"/api/me/notifications/read","type":0,"val":"me","end":""},{"old":"/api/me/notifications/read","type":0,"val":"notifications","end":""},{"old":"/api/me/notifications/read","type":0,"val":"read","end":""}],
    types: placeholder as Registry['user_notifications.read']['types'],
  },
  'support_tickets.store': {
    methods: ["POST"],
    pattern: '/api/support/tickets',
    tokens: [{"old":"/api/support/tickets","type":0,"val":"api","end":""},{"old":"/api/support/tickets","type":0,"val":"support","end":""},{"old":"/api/support/tickets","type":0,"val":"tickets","end":""}],
    types: placeholder as Registry['support_tickets.store']['types'],
  },
  'support_tickets.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/support/tickets',
    tokens: [{"old":"/api/support/tickets","type":0,"val":"api","end":""},{"old":"/api/support/tickets","type":0,"val":"support","end":""},{"old":"/api/support/tickets","type":0,"val":"tickets","end":""}],
    types: placeholder as Registry['support_tickets.index']['types'],
  },
  'support_tickets.mine': {
    methods: ["GET","HEAD"],
    pattern: '/api/support/tickets/mine',
    tokens: [{"old":"/api/support/tickets/mine","type":0,"val":"api","end":""},{"old":"/api/support/tickets/mine","type":0,"val":"support","end":""},{"old":"/api/support/tickets/mine","type":0,"val":"tickets","end":""},{"old":"/api/support/tickets/mine","type":0,"val":"mine","end":""}],
    types: placeholder as Registry['support_tickets.mine']['types'],
  },
  'support_tickets.unread': {
    methods: ["GET","HEAD"],
    pattern: '/api/support/tickets/unread',
    tokens: [{"old":"/api/support/tickets/unread","type":0,"val":"api","end":""},{"old":"/api/support/tickets/unread","type":0,"val":"support","end":""},{"old":"/api/support/tickets/unread","type":0,"val":"tickets","end":""},{"old":"/api/support/tickets/unread","type":0,"val":"unread","end":""}],
    types: placeholder as Registry['support_tickets.unread']['types'],
  },
  'support_tickets.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/support/tickets/:id',
    tokens: [{"old":"/api/support/tickets/:id","type":0,"val":"api","end":""},{"old":"/api/support/tickets/:id","type":0,"val":"support","end":""},{"old":"/api/support/tickets/:id","type":0,"val":"tickets","end":""},{"old":"/api/support/tickets/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['support_tickets.show']['types'],
  },
  'support_tickets.reply': {
    methods: ["POST"],
    pattern: '/api/support/tickets/:id/replies',
    tokens: [{"old":"/api/support/tickets/:id/replies","type":0,"val":"api","end":""},{"old":"/api/support/tickets/:id/replies","type":0,"val":"support","end":""},{"old":"/api/support/tickets/:id/replies","type":0,"val":"tickets","end":""},{"old":"/api/support/tickets/:id/replies","type":1,"val":"id","end":""},{"old":"/api/support/tickets/:id/replies","type":0,"val":"replies","end":""}],
    types: placeholder as Registry['support_tickets.reply']['types'],
  },
  'support_tickets.mark_read': {
    methods: ["PATCH"],
    pattern: '/api/support/tickets/:id/read',
    tokens: [{"old":"/api/support/tickets/:id/read","type":0,"val":"api","end":""},{"old":"/api/support/tickets/:id/read","type":0,"val":"support","end":""},{"old":"/api/support/tickets/:id/read","type":0,"val":"tickets","end":""},{"old":"/api/support/tickets/:id/read","type":1,"val":"id","end":""},{"old":"/api/support/tickets/:id/read","type":0,"val":"read","end":""}],
    types: placeholder as Registry['support_tickets.mark_read']['types'],
  },
  'support_tickets.update_status': {
    methods: ["PATCH"],
    pattern: '/api/support/tickets/:id/status',
    tokens: [{"old":"/api/support/tickets/:id/status","type":0,"val":"api","end":""},{"old":"/api/support/tickets/:id/status","type":0,"val":"support","end":""},{"old":"/api/support/tickets/:id/status","type":0,"val":"tickets","end":""},{"old":"/api/support/tickets/:id/status","type":1,"val":"id","end":""},{"old":"/api/support/tickets/:id/status","type":0,"val":"status","end":""}],
    types: placeholder as Registry['support_tickets.update_status']['types'],
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
  'profile.logo': {
    methods: ["GET","HEAD"],
    pattern: '/api/public/perfil-logo/:id',
    tokens: [{"old":"/api/public/perfil-logo/:id","type":0,"val":"api","end":""},{"old":"/api/public/perfil-logo/:id","type":0,"val":"public","end":""},{"old":"/api/public/perfil-logo/:id","type":0,"val":"perfil-logo","end":""},{"old":"/api/public/perfil-logo/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['profile.logo']['types'],
  },
  'portfolio.public_index': {
    methods: ["GET","HEAD"],
    pattern: '/api/public/:slug/portfolio',
    tokens: [{"old":"/api/public/:slug/portfolio","type":0,"val":"api","end":""},{"old":"/api/public/:slug/portfolio","type":0,"val":"public","end":""},{"old":"/api/public/:slug/portfolio","type":1,"val":"slug","end":""},{"old":"/api/public/:slug/portfolio","type":0,"val":"portfolio","end":""}],
    types: placeholder as Registry['portfolio.public_index']['types'],
  },
  'portfolio.image': {
    methods: ["GET","HEAD"],
    pattern: '/api/public/portfolio/:id/imagem',
    tokens: [{"old":"/api/public/portfolio/:id/imagem","type":0,"val":"api","end":""},{"old":"/api/public/portfolio/:id/imagem","type":0,"val":"public","end":""},{"old":"/api/public/portfolio/:id/imagem","type":0,"val":"portfolio","end":""},{"old":"/api/public/portfolio/:id/imagem","type":1,"val":"id","end":""},{"old":"/api/public/portfolio/:id/imagem","type":0,"val":"imagem","end":""}],
    types: placeholder as Registry['portfolio.image']['types'],
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
  'portfolio.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/admin/:slug/portfolio',
    tokens: [{"old":"/api/admin/:slug/portfolio","type":0,"val":"api","end":""},{"old":"/api/admin/:slug/portfolio","type":0,"val":"admin","end":""},{"old":"/api/admin/:slug/portfolio","type":1,"val":"slug","end":""},{"old":"/api/admin/:slug/portfolio","type":0,"val":"portfolio","end":""}],
    types: placeholder as Registry['portfolio.index']['types'],
  },
  'portfolio.store': {
    methods: ["POST"],
    pattern: '/api/admin/:slug/portfolio',
    tokens: [{"old":"/api/admin/:slug/portfolio","type":0,"val":"api","end":""},{"old":"/api/admin/:slug/portfolio","type":0,"val":"admin","end":""},{"old":"/api/admin/:slug/portfolio","type":1,"val":"slug","end":""},{"old":"/api/admin/:slug/portfolio","type":0,"val":"portfolio","end":""}],
    types: placeholder as Registry['portfolio.store']['types'],
  },
  'portfolio.destroy': {
    methods: ["DELETE"],
    pattern: '/api/admin/:slug/portfolio/:id',
    tokens: [{"old":"/api/admin/:slug/portfolio/:id","type":0,"val":"api","end":""},{"old":"/api/admin/:slug/portfolio/:id","type":0,"val":"admin","end":""},{"old":"/api/admin/:slug/portfolio/:id","type":1,"val":"slug","end":""},{"old":"/api/admin/:slug/portfolio/:id","type":0,"val":"portfolio","end":""},{"old":"/api/admin/:slug/portfolio/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['portfolio.destroy']['types'],
  },
  'servicos.public_index': {
    methods: ["GET","HEAD"],
    pattern: '/api/public/:slug/servicos',
    tokens: [{"old":"/api/public/:slug/servicos","type":0,"val":"api","end":""},{"old":"/api/public/:slug/servicos","type":0,"val":"public","end":""},{"old":"/api/public/:slug/servicos","type":1,"val":"slug","end":""},{"old":"/api/public/:slug/servicos","type":0,"val":"servicos","end":""}],
    types: placeholder as Registry['servicos.public_index']['types'],
  },
  'public_slots.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/public/:slug/slots',
    tokens: [{"old":"/api/public/:slug/slots","type":0,"val":"api","end":""},{"old":"/api/public/:slug/slots","type":0,"val":"public","end":""},{"old":"/api/public/:slug/slots","type":1,"val":"slug","end":""},{"old":"/api/public/:slug/slots","type":0,"val":"slots","end":""}],
    types: placeholder as Registry['public_slots.index']['types'],
  },
  'public_bookings.store': {
    methods: ["POST"],
    pattern: '/api/public/:slug/agendar',
    tokens: [{"old":"/api/public/:slug/agendar","type":0,"val":"api","end":""},{"old":"/api/public/:slug/agendar","type":0,"val":"public","end":""},{"old":"/api/public/:slug/agendar","type":1,"val":"slug","end":""},{"old":"/api/public/:slug/agendar","type":0,"val":"agendar","end":""}],
    types: placeholder as Registry['public_bookings.store']['types'],
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
  'admin_dashboard.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/admin/:slug/dashboard',
    tokens: [{"old":"/api/admin/:slug/dashboard","type":0,"val":"api","end":""},{"old":"/api/admin/:slug/dashboard","type":0,"val":"admin","end":""},{"old":"/api/admin/:slug/dashboard","type":1,"val":"slug","end":""},{"old":"/api/admin/:slug/dashboard","type":0,"val":"dashboard","end":""}],
    types: placeholder as Registry['admin_dashboard.show']['types'],
  },
  'admin_agenda.manual': {
    methods: ["POST"],
    pattern: '/api/admin/:slug/agenda/manual',
    tokens: [{"old":"/api/admin/:slug/agenda/manual","type":0,"val":"api","end":""},{"old":"/api/admin/:slug/agenda/manual","type":0,"val":"admin","end":""},{"old":"/api/admin/:slug/agenda/manual","type":1,"val":"slug","end":""},{"old":"/api/admin/:slug/agenda/manual","type":0,"val":"agenda","end":""},{"old":"/api/admin/:slug/agenda/manual","type":0,"val":"manual","end":""}],
    types: placeholder as Registry['admin_agenda.manual']['types'],
  },
  'admin_agenda.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/admin/:slug/agenda/:id',
    tokens: [{"old":"/api/admin/:slug/agenda/:id","type":0,"val":"api","end":""},{"old":"/api/admin/:slug/agenda/:id","type":0,"val":"admin","end":""},{"old":"/api/admin/:slug/agenda/:id","type":1,"val":"slug","end":""},{"old":"/api/admin/:slug/agenda/:id","type":0,"val":"agenda","end":""},{"old":"/api/admin/:slug/agenda/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['admin_agenda.show']['types'],
  },
  'admin_agenda.update_status': {
    methods: ["PATCH"],
    pattern: '/api/admin/:slug/agenda/:id/status',
    tokens: [{"old":"/api/admin/:slug/agenda/:id/status","type":0,"val":"api","end":""},{"old":"/api/admin/:slug/agenda/:id/status","type":0,"val":"admin","end":""},{"old":"/api/admin/:slug/agenda/:id/status","type":1,"val":"slug","end":""},{"old":"/api/admin/:slug/agenda/:id/status","type":0,"val":"agenda","end":""},{"old":"/api/admin/:slug/agenda/:id/status","type":1,"val":"id","end":""},{"old":"/api/admin/:slug/agenda/:id/status","type":0,"val":"status","end":""}],
    types: placeholder as Registry['admin_agenda.update_status']['types'],
  },
  'admin_agenda.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/admin/:slug/agenda',
    tokens: [{"old":"/api/admin/:slug/agenda","type":0,"val":"api","end":""},{"old":"/api/admin/:slug/agenda","type":0,"val":"admin","end":""},{"old":"/api/admin/:slug/agenda","type":1,"val":"slug","end":""},{"old":"/api/admin/:slug/agenda","type":0,"val":"agenda","end":""}],
    types: placeholder as Registry['admin_agenda.index']['types'],
  },
  'admin_slots.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/admin/:slug/slots',
    tokens: [{"old":"/api/admin/:slug/slots","type":0,"val":"api","end":""},{"old":"/api/admin/:slug/slots","type":0,"val":"admin","end":""},{"old":"/api/admin/:slug/slots","type":1,"val":"slug","end":""},{"old":"/api/admin/:slug/slots","type":0,"val":"slots","end":""}],
    types: placeholder as Registry['admin_slots.index']['types'],
  },
  'disponibilidade.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/admin/:slug/disponibilidade',
    tokens: [{"old":"/api/admin/:slug/disponibilidade","type":0,"val":"api","end":""},{"old":"/api/admin/:slug/disponibilidade","type":0,"val":"admin","end":""},{"old":"/api/admin/:slug/disponibilidade","type":1,"val":"slug","end":""},{"old":"/api/admin/:slug/disponibilidade","type":0,"val":"disponibilidade","end":""}],
    types: placeholder as Registry['disponibilidade.show']['types'],
  },
  'disponibilidade.update': {
    methods: ["PUT"],
    pattern: '/api/admin/:slug/disponibilidade',
    tokens: [{"old":"/api/admin/:slug/disponibilidade","type":0,"val":"api","end":""},{"old":"/api/admin/:slug/disponibilidade","type":0,"val":"admin","end":""},{"old":"/api/admin/:slug/disponibilidade","type":1,"val":"slug","end":""},{"old":"/api/admin/:slug/disponibilidade","type":0,"val":"disponibilidade","end":""}],
    types: placeholder as Registry['disponibilidade.update']['types'],
  },
  'admin_whatsapp.status': {
    methods: ["GET","HEAD"],
    pattern: '/api/admin/:slug/whatsapp/status',
    tokens: [{"old":"/api/admin/:slug/whatsapp/status","type":0,"val":"api","end":""},{"old":"/api/admin/:slug/whatsapp/status","type":0,"val":"admin","end":""},{"old":"/api/admin/:slug/whatsapp/status","type":1,"val":"slug","end":""},{"old":"/api/admin/:slug/whatsapp/status","type":0,"val":"whatsapp","end":""},{"old":"/api/admin/:slug/whatsapp/status","type":0,"val":"status","end":""}],
    types: placeholder as Registry['admin_whatsapp.status']['types'],
  },
  'admin_whatsapp.conectar': {
    methods: ["POST"],
    pattern: '/api/admin/:slug/whatsapp/conectar',
    tokens: [{"old":"/api/admin/:slug/whatsapp/conectar","type":0,"val":"api","end":""},{"old":"/api/admin/:slug/whatsapp/conectar","type":0,"val":"admin","end":""},{"old":"/api/admin/:slug/whatsapp/conectar","type":1,"val":"slug","end":""},{"old":"/api/admin/:slug/whatsapp/conectar","type":0,"val":"whatsapp","end":""},{"old":"/api/admin/:slug/whatsapp/conectar","type":0,"val":"conectar","end":""}],
    types: placeholder as Registry['admin_whatsapp.conectar']['types'],
  },
  'admin_whatsapp.desconectar': {
    methods: ["POST"],
    pattern: '/api/admin/:slug/whatsapp/desconectar',
    tokens: [{"old":"/api/admin/:slug/whatsapp/desconectar","type":0,"val":"api","end":""},{"old":"/api/admin/:slug/whatsapp/desconectar","type":0,"val":"admin","end":""},{"old":"/api/admin/:slug/whatsapp/desconectar","type":1,"val":"slug","end":""},{"old":"/api/admin/:slug/whatsapp/desconectar","type":0,"val":"whatsapp","end":""},{"old":"/api/admin/:slug/whatsapp/desconectar","type":0,"val":"desconectar","end":""}],
    types: placeholder as Registry['admin_whatsapp.desconectar']['types'],
  },
  'admin_whatsapp.mensagens': {
    methods: ["GET","HEAD"],
    pattern: '/api/admin/:slug/whatsapp/mensagens',
    tokens: [{"old":"/api/admin/:slug/whatsapp/mensagens","type":0,"val":"api","end":""},{"old":"/api/admin/:slug/whatsapp/mensagens","type":0,"val":"admin","end":""},{"old":"/api/admin/:slug/whatsapp/mensagens","type":1,"val":"slug","end":""},{"old":"/api/admin/:slug/whatsapp/mensagens","type":0,"val":"whatsapp","end":""},{"old":"/api/admin/:slug/whatsapp/mensagens","type":0,"val":"mensagens","end":""}],
    types: placeholder as Registry['admin_whatsapp.mensagens']['types'],
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
