/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  auth: {
    login: typeof routes['auth.login']
    refresh: typeof routes['auth.refresh']
    logout: typeof routes['auth.logout']
    changePassword: typeof routes['auth.change_password']
  }
  userNotifications: {
    index: typeof routes['user_notifications.index']
    read: typeof routes['user_notifications.read']
  }
  supportTickets: {
    store: typeof routes['support_tickets.store']
    index: typeof routes['support_tickets.index']
    mine: typeof routes['support_tickets.mine']
    unread: typeof routes['support_tickets.unread']
    show: typeof routes['support_tickets.show']
    reply: typeof routes['support_tickets.reply']
    markRead: typeof routes['support_tickets.mark_read']
    updateStatus: typeof routes['support_tickets.update_status']
  }
  users: {
    index: typeof routes['users.index']
    impersonate: typeof routes['users.impersonate']
    store: typeof routes['users.store']
  }
  profile: {
    publicShow: typeof routes['profile.public_show']
    logo: typeof routes['profile.logo']
    show: typeof routes['profile.show']
    update: typeof routes['profile.update']
  }
  portfolio: {
    publicIndex: typeof routes['portfolio.public_index']
    image: typeof routes['portfolio.image']
    index: typeof routes['portfolio.index']
    store: typeof routes['portfolio.store']
    destroy: typeof routes['portfolio.destroy']
  }
  servicos: {
    publicIndex: typeof routes['servicos.public_index']
    index: typeof routes['servicos.index']
    store: typeof routes['servicos.store']
    update: typeof routes['servicos.update']
    destroy: typeof routes['servicos.destroy']
  }
  publicSlots: {
    index: typeof routes['public_slots.index']
  }
  publicBookings: {
    store: typeof routes['public_bookings.store']
  }
  adminDashboard: {
    show: typeof routes['admin_dashboard.show']
  }
  adminAgenda: {
    manual: typeof routes['admin_agenda.manual']
    show: typeof routes['admin_agenda.show']
    updateStatus: typeof routes['admin_agenda.update_status']
    index: typeof routes['admin_agenda.index']
  }
  adminSlots: {
    index: typeof routes['admin_slots.index']
  }
  disponibilidade: {
    show: typeof routes['disponibilidade.show']
    update: typeof routes['disponibilidade.update']
  }
  adminWhatsapp: {
    status: typeof routes['admin_whatsapp.status']
    conectar: typeof routes['admin_whatsapp.conectar']
    desconectar: typeof routes['admin_whatsapp.desconectar']
    mensagens: typeof routes['admin_whatsapp.mensagens']
  }
}
