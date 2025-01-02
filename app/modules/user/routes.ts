import router from '@adonisjs/core/services/router'
const UserController = () => import('#controllers/users_controller')

router
  .group(() => {
    router.post('/register', [UserController, 'addUser'])
    router.get('/users', [UserController, 'getAllUsers'])
    router.get('/users/:id', [UserController, 'getUserDetails'])
  })
  .prefix('/api/v1')
