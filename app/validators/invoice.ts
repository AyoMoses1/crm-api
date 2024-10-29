import vine from '@vinejs/vine'

export const invoiceGenerationValidator = vine.compile(
  vine.object({
    client_id: vine.number().exists(async (db, value) => {
      const client = await db.from('clients').where('id', value).first()
      return !!client
    }),
    services: vine.array(
      vine.object({
        service_id: vine.number().exists(async (db, value) => {
          const service = await db.from('services').where('id', value).first()
          return !!service
        }),
        quantity: vine.number().min(1),
      })
    ),
  })
)

export const updateInvoiceStatusValidator = vine.compile(
  vine.object({
    status: vine.enum(['draft', 'sent', 'paid', 'overdue']),
  })
)
