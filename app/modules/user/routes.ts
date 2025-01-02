import router from '@adonisjs/core/services/router'
const UserController = () => import('#controllers/users_controller')

router
  .group(() => {
    router.post('/register', [UserController, 'addUser'])
    router.get('/users', [UserController, 'getAllUsers'])
    router.get('/users/:id', [UserController, 'getUserDetails'])
    router.put('/users/:id', [UserController, 'updateUser'])
  })
  .prefix('/api/v1')
