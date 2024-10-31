import vine from '@vinejs/vine'

export const campaignPayloadValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(3).maxLength(255),
    description: vine.string().maxLength(1000).optional(),
    start_date: vine.date({
      formats: ['YYYY-MM-DD', 'x'],
    }),
    end_date: vine
      .date({
        formats: ['YYYY-MM-DD', 'x'],
      })
      .afterField('start_date'),
    status: vine.enum(['active', 'draft', 'completed']),
    image: vine.string().optional(), // Assuming image is a URL; adjust as needed
    email_header: vine.string().trim().maxLength(255).optional(),
    email_sub_header: vine.string().trim().maxLength(255).optional(),
    channel: vine.enum(['email', 'whatsapp', 'sms']),
    client_ids: vine.array(
      vine.number().exists(async (db, value) => {
        const client = await db.from('clients').where('id', value).first()
        return !!client
      })
    ),
  })
)
