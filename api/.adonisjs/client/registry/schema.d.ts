/* eslint-disable prettier/prettier */
/// <reference path="../manifest.d.ts" />

import type { ExtractBody, ExtractErrorResponse, ExtractQuery, ExtractQueryForGet, ExtractResponse } from '@tuyau/core/types'
import type { InferInput, SimpleError } from '@vinejs/vine/types'

export type ParamValue = string | number | bigint | boolean

export interface Registry {
  'auth.login': {
    methods: ["POST"]
    pattern: '/api/login'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'auth.refresh': {
    methods: ["POST"]
    pattern: '/api/refresh'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'auth.logout': {
    methods: ["POST"]
    pattern: '/api/logout'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'auth.change_password': {
    methods: ["PATCH"]
    pattern: '/api/me/senha'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'users.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/users'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'users.impersonate': {
    methods: ["POST"]
    pattern: '/api/users/impersonate/:slug'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { slug: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'users.store': {
    methods: ["POST"]
    pattern: '/api/users'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'profile.public_show': {
    methods: ["GET","HEAD"]
    pattern: '/api/public/:slug/perfil'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { slug: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'profile.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/admin/:slug/perfil'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { slug: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'profile.update': {
    methods: ["PUT"]
    pattern: '/api/admin/:slug/perfil'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { slug: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'servicos.public_index': {
    methods: ["GET","HEAD"]
    pattern: '/api/public/:slug/servicos'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { slug: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'public_slots.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/public/:slug/slots'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { slug: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'public_bookings.store': {
    methods: ["POST"]
    pattern: '/api/public/:slug/agendar'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { slug: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'servicos.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/admin/:slug/servicos'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { slug: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'servicos.store': {
    methods: ["POST"]
    pattern: '/api/admin/:slug/servicos'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { slug: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'servicos.update': {
    methods: ["PUT"]
    pattern: '/api/admin/:slug/servicos/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue]
      params: { slug: ParamValue; id: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'servicos.destroy': {
    methods: ["DELETE"]
    pattern: '/api/admin/:slug/servicos/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue]
      params: { slug: ParamValue; id: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'admin_dashboard.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/admin/:slug/dashboard'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { slug: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'admin_agenda.manual': {
    methods: ["POST"]
    pattern: '/api/admin/:slug/agenda/manual'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { slug: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'admin_agenda.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/admin/:slug/agenda/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue]
      params: { slug: ParamValue; id: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'admin_agenda.update_status': {
    methods: ["PATCH"]
    pattern: '/api/admin/:slug/agenda/:id/status'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue]
      params: { slug: ParamValue; id: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'admin_agenda.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/admin/:slug/agenda'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { slug: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'admin_slots.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/admin/:slug/slots'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { slug: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'disponibilidade.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/admin/:slug/disponibilidade'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { slug: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'disponibilidade.update': {
    methods: ["PUT"]
    pattern: '/api/admin/:slug/disponibilidade'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { slug: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'admin_whatsapp.status': {
    methods: ["GET","HEAD"]
    pattern: '/api/admin/:slug/whatsapp/status'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { slug: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'admin_whatsapp.conectar': {
    methods: ["POST"]
    pattern: '/api/admin/:slug/whatsapp/conectar'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { slug: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'admin_whatsapp.desconectar': {
    methods: ["POST"]
    pattern: '/api/admin/:slug/whatsapp/desconectar'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { slug: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
}
