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
  }
}
