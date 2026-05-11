import { setupWorker } from "msw/browser"
import { authHandlers } from "./handlers/auth"
import { masterHandlers } from "./handlers/master"
import { adminHandlers } from "./handlers/admin"
import { publicHandlers } from "./handlers/public"

export const worker = setupWorker(...authHandlers, ...masterHandlers, ...adminHandlers, ...publicHandlers)
