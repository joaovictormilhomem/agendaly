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
import ServicosController from '#controllers/servicos_controller'
import ProfileController from '#controllers/profile_controller'
import DisponibilidadeController from '#controllers/disponibilidade_controller'

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
  .get('/api/users', [UsersController, 'index'])
  .use(middleware.jwtAuth())
  .use(middleware.superadmin())

router
  .post('/api/users/impersonate/:slug', [UsersController, 'impersonate'])
  .use(middleware.jwtAuth())
  .use(middleware.superadmin())

router
  .post('/api/users', [UsersController, 'store'])
  .use(middleware.jwtAuth())
  .use(middleware.superadmin())

// Perfil — público
router.get('/api/public/:slug/perfil', [ProfileController, 'publicShow'])

// Perfil — admin
router
  .get('/api/admin/:slug/perfil', [ProfileController, 'show'])
  .use(middleware.jwtAuth())

router
  .put('/api/admin/:slug/perfil', [ProfileController, 'update'])
  .use(middleware.jwtAuth())

// Serviços — público
router.get('/api/public/:slug/servicos', [ServicosController, 'publicIndex'])

// Serviços — admin
router
  .get('/api/admin/:slug/servicos', [ServicosController, 'index'])
  .use(middleware.jwtAuth())

router
  .post('/api/admin/:slug/servicos', [ServicosController, 'store'])
  .use(middleware.jwtAuth())

router
  .put('/api/admin/:slug/servicos/:id', [ServicosController, 'update'])
  .use(middleware.jwtAuth())

router
  .delete('/api/admin/:slug/servicos/:id', [ServicosController, 'destroy'])
  .use(middleware.jwtAuth())

// Disponibilidade — admin
router
  .get('/api/admin/:slug/disponibilidade', [DisponibilidadeController, 'show'])
  .use(middleware.jwtAuth())

router
  .put('/api/admin/:slug/disponibilidade', [DisponibilidadeController, 'update'])
  .use(middleware.jwtAuth())
