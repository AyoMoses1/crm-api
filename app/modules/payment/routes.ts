import router from '@adonisjs/core/services/router'
const InvoicesController = () => import('#controllers/invoices_controller')

router
  .group(() => {
    router.post('/payment/webhook', [InvoicesController, 'handleWebhook'])
  })
  .prefix('/api/v1')
