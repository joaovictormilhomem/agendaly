/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'
import AuthController from '#controllers/auth_controller'
import UsersController from '#controllers/users_controller'

router.get('/', () => {
  return { hello: 'world' }
})

router.post('/api/login', [AuthController, 'login'])
router.post('/api/refresh', [AuthController, 'refresh'])
router.post('/api/logout', [AuthController, 'logout']).use(middleware.jwtAuth())

router.get('/api/me', async ({ authJwt, response }) => {
  if (!authJwt) return response.unauthorized()
  return response.ok({
    id: authJwt.user.id,
    role: authJwt.user.role,
    slug: authJwt.user.slug,
    email: authJwt.user.email,
    name: authJwt.user.name,
  })
}).use(middleware.jwtAuth())

router
  .post('/api/users', [UsersController, 'store'])
  .use(middleware.jwtAuth())
  .use(middleware.superadmin())
