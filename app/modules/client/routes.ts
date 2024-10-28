import router from '@adonisjs/core/services/router'
const ClientController = () => import('#controllers/clients_controller')

router
  .group(() => {
    router.post('/clients/register', [ClientController, 'addClient'])
  })
  .prefix('/api/v1')
