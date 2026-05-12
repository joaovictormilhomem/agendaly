import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'auth.login': { paramsTuple?: []; params?: {} }
    'auth.refresh': { paramsTuple?: []; params?: {} }
    'auth.logout': { paramsTuple?: []; params?: {} }
    'users.index': { paramsTuple?: []; params?: {} }
    'users.impersonate': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'users.store': { paramsTuple?: []; params?: {} }
    'profile.public_show': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'profile.show': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'profile.update': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'servicos.public_index': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'servicos.index': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'servicos.store': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'servicos.update': { paramsTuple: [ParamValue,ParamValue]; params: {'slug': ParamValue,'id': ParamValue} }
    'servicos.destroy': { paramsTuple: [ParamValue,ParamValue]; params: {'slug': ParamValue,'id': ParamValue} }
    'disponibilidade.show': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'disponibilidade.update': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
  }
  GET: {
    'users.index': { paramsTuple?: []; params?: {} }
    'profile.public_show': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'profile.show': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'servicos.public_index': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'servicos.index': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'disponibilidade.show': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
  }
  HEAD: {
    'users.index': { paramsTuple?: []; params?: {} }
    'profile.public_show': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'profile.show': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'servicos.public_index': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'servicos.index': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'disponibilidade.show': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
  }
  POST: {
    'auth.login': { paramsTuple?: []; params?: {} }
    'auth.refresh': { paramsTuple?: []; params?: {} }
    'auth.logout': { paramsTuple?: []; params?: {} }
    'users.impersonate': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'users.store': { paramsTuple?: []; params?: {} }
    'servicos.store': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
  }
  PUT: {
    'profile.update': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'servicos.update': { paramsTuple: [ParamValue,ParamValue]; params: {'slug': ParamValue,'id': ParamValue} }
    'disponibilidade.update': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
  }
  DELETE: {
    'servicos.destroy': { paramsTuple: [ParamValue,ParamValue]; params: {'slug': ParamValue,'id': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}