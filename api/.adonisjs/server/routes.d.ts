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
  }
  GET: {
    'users.index': { paramsTuple?: []; params?: {} }
    'profile.public_show': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'profile.show': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
  }
  HEAD: {
    'users.index': { paramsTuple?: []; params?: {} }
    'profile.public_show': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'profile.show': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
  }
  POST: {
    'auth.login': { paramsTuple?: []; params?: {} }
    'auth.refresh': { paramsTuple?: []; params?: {} }
    'auth.logout': { paramsTuple?: []; params?: {} }
    'users.impersonate': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'users.store': { paramsTuple?: []; params?: {} }
  }
  PUT: {
    'profile.update': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}