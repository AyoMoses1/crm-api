import router from '@adonisjs/core/services/router'
const ServicesController = () => import('#controllers/services_controller')

router
  .group(() => {
    router.post('/services', [ServicesController, 'addService'])
    router.get('/services', [ServicesController, 'fetchServices'])
    router.put('/services/:id', [ServicesController, 'updateService'])
    router.get('/services/:id', [ServicesController, 'fetchServiceDetails'])
    router.delete('/services/:id', [ServicesController, 'deleteService'])
  })
  .prefix('/api/v1')
