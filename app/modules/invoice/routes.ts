import router from '@adonisjs/core/services/router'
const InvoicesController = () => import('#controllers/invoices_controller')

router
  .group(() => {
    router.post('/invoices', [InvoicesController, 'generateInvoice'])
    router.get('/invoices', [InvoicesController, 'fetchAllInvoices'])
    router.put('/invoices/:id', [InvoicesController, 'updateInvoice'])
    router.get('/invoices/:id', [InvoicesController, 'fetchInvoiceDetails'])
  })
  .prefix('/api/v1')
