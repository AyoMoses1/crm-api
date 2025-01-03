import router from '@adonisjs/core/services/router'
const InvoicesController = () => import('#controllers/invoices_controller')
const PaymentsController = () => import('#controllers/payments_controller')

router
  .group(() => {
    router.post('/payment/webhook', [InvoicesController, 'handleWebhook'])
    router.get('/client/:clientId/payments', [PaymentsController, 'getClientPayments'])

    router.get('/payments/:id', [PaymentsController, 'getPaymentDetails'])

    router.get('/invoice/:invoice_id/payments', [PaymentsController, 'getPaymentsByInvoice'])
  })
  .prefix('/api/v1')
