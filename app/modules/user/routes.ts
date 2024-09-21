import router from '@adonisjs/core/services/router'
const UserController = () => import('#controllers/users_controller')

router
  .group(() => {
    router.post('/register', [UserController, 'addUser'])
  })
  .prefix('/api/v1/')