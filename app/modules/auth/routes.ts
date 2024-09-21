import router from '@adonisjs/core/services/router'
const AuthController = () => import('#controllers/auth_controller')

router
  .group(() => {
    router.post('/verify-email', [AuthController, 'verifyEmail'])
  })
  .prefix('/api/v1/auth')
