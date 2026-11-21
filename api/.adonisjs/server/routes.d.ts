import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'auth.login': { paramsTuple?: []; params?: {} }
    'auth.refresh': { paramsTuple?: []; params?: {} }
    'auth.logout': { paramsTuple?: []; params?: {} }
    'auth.change_password': { paramsTuple?: []; params?: {} }
    'user_notifications.index': { paramsTuple?: []; params?: {} }
    'user_notifications.read': { paramsTuple?: []; params?: {} }
    'support_tickets.store': { paramsTuple?: []; params?: {} }
    'support_tickets.index': { paramsTuple?: []; params?: {} }
    'support_tickets.mine': { paramsTuple?: []; params?: {} }
    'support_tickets.unread': { paramsTuple?: []; params?: {} }
    'support_tickets.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'support_tickets.reply': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'support_tickets.mark_read': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'support_tickets.update_status': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'users.index': { paramsTuple?: []; params?: {} }
    'users.impersonate': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'users.store': { paramsTuple?: []; params?: {} }
    'profile.public_show': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'profile.logo': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'portfolio.public_index': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'portfolio.image': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'profile.show': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'profile.update': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'portfolio.index': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'portfolio.store': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'portfolio.destroy': { paramsTuple: [ParamValue,ParamValue]; params: {'slug': ParamValue,'id': ParamValue} }
    'servicos.public_index': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'public_slots.index': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'public_bookings.store': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'servicos.index': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'servicos.store': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'servicos.update': { paramsTuple: [ParamValue,ParamValue]; params: {'slug': ParamValue,'id': ParamValue} }
    'servicos.destroy': { paramsTuple: [ParamValue,ParamValue]; params: {'slug': ParamValue,'id': ParamValue} }
    'admin_dashboard.show': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'admin_agenda.manual': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'admin_agenda.show': { paramsTuple: [ParamValue,ParamValue]; params: {'slug': ParamValue,'id': ParamValue} }
    'admin_agenda.update_status': { paramsTuple: [ParamValue,ParamValue]; params: {'slug': ParamValue,'id': ParamValue} }
    'admin_agenda.index': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'admin_slots.index': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'disponibilidade.show': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'disponibilidade.update': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'admin_whatsapp.status': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'admin_whatsapp.conectar': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'admin_whatsapp.desconectar': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'admin_whatsapp.mensagens': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
  }
  GET: {
    'user_notifications.index': { paramsTuple?: []; params?: {} }
    'support_tickets.index': { paramsTuple?: []; params?: {} }
    'support_tickets.mine': { paramsTuple?: []; params?: {} }
    'support_tickets.unread': { paramsTuple?: []; params?: {} }
    'support_tickets.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'users.index': { paramsTuple?: []; params?: {} }
    'profile.public_show': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'profile.logo': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'portfolio.public_index': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'portfolio.image': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'profile.show': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'portfolio.index': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'servicos.public_index': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'public_slots.index': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'servicos.index': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'admin_dashboard.show': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'admin_agenda.show': { paramsTuple: [ParamValue,ParamValue]; params: {'slug': ParamValue,'id': ParamValue} }
    'admin_agenda.index': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'admin_slots.index': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'disponibilidade.show': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'admin_whatsapp.status': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'admin_whatsapp.mensagens': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
  }
  HEAD: {
    'user_notifications.index': { paramsTuple?: []; params?: {} }
    'support_tickets.index': { paramsTuple?: []; params?: {} }
    'support_tickets.mine': { paramsTuple?: []; params?: {} }
    'support_tickets.unread': { paramsTuple?: []; params?: {} }
    'support_tickets.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'users.index': { paramsTuple?: []; params?: {} }
    'profile.public_show': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'profile.logo': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'portfolio.public_index': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'portfolio.image': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'profile.show': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'portfolio.index': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'servicos.public_index': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'public_slots.index': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'servicos.index': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'admin_dashboard.show': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'admin_agenda.show': { paramsTuple: [ParamValue,ParamValue]; params: {'slug': ParamValue,'id': ParamValue} }
    'admin_agenda.index': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'admin_slots.index': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'disponibilidade.show': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'admin_whatsapp.status': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'admin_whatsapp.mensagens': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
  }
  POST: {
    'auth.login': { paramsTuple?: []; params?: {} }
    'auth.refresh': { paramsTuple?: []; params?: {} }
    'auth.logout': { paramsTuple?: []; params?: {} }
    'support_tickets.store': { paramsTuple?: []; params?: {} }
    'support_tickets.reply': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'users.impersonate': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'users.store': { paramsTuple?: []; params?: {} }
    'portfolio.store': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'public_bookings.store': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'servicos.store': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'admin_agenda.manual': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'admin_whatsapp.conectar': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'admin_whatsapp.desconectar': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
  }
  PATCH: {
    'auth.change_password': { paramsTuple?: []; params?: {} }
    'user_notifications.read': { paramsTuple?: []; params?: {} }
    'support_tickets.mark_read': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'support_tickets.update_status': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_agenda.update_status': { paramsTuple: [ParamValue,ParamValue]; params: {'slug': ParamValue,'id': ParamValue} }
  }
  PUT: {
    'profile.update': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'servicos.update': { paramsTuple: [ParamValue,ParamValue]; params: {'slug': ParamValue,'id': ParamValue} }
    'disponibilidade.update': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
  }
  DELETE: {
    'portfolio.destroy': { paramsTuple: [ParamValue,ParamValue]; params: {'slug': ParamValue,'id': ParamValue} }
    'servicos.destroy': { paramsTuple: [ParamValue,ParamValue]; params: {'slug': ParamValue,'id': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}