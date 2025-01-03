import router from '@adonisjs/core/services/router'
const AuthController = () => import('#controllers/auth_controller')

router
  .group(() => {
    router.post('/verify-email', [AuthController, 'verifyEmail'])
    router.post('/set-password', [AuthController, 'setPassword'])
    router.post('/login', [AuthController, 'login'])
  })
  .prefix('/api/v1/auth')
