import vine from '@vinejs/vine'

export const scheduleAppointmentValidator = vine.compile(
  vine.object({
    client_id: vine.number().exists(async (db, value) => {
      const client = await db.from('clients').where('id', value).first()
      return !!client
    }),
    appointment_date: vine.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/),
    description: vine.string().optional(),
  })
)

export const rescheduleAppointmentValidator = vine.compile(
  vine.object({
    appointment_date: vine.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/),
    description: vine.string().optional(),
  })
)
