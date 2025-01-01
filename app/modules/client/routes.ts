import router from '@adonisjs/core/services/router'
const ClientController = () => import('#controllers/clients_controller')

router
  .group(() => {
    router.get('/clients/statistics', [ClientController, 'getClientStatistics'])
    router.post('/clients/register', [ClientController, 'addClient'])
    router.get('/clients', [ClientController, 'getAllClients'])
    router.get('/clients/:id', [ClientController, 'getClientDetails'])
    router.get('/client/:clientId/invoices', [ClientController, 'fetchClientInvoices'])
    router.put('/clients/:id', [ClientController, 'updateClient'])
  })
  .prefix('/api/v1')
