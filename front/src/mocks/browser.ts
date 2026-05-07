import { setupWorker } from "msw/browser"
import { authHandlers } from "./handlers/auth"
import { masterHandlers } from "./handlers/master"
import { adminHandlers } from "./handlers/admin"

export const worker = setupWorker(...authHandlers, ...masterHandlers, ...adminHandlers)
