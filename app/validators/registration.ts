import vine from '@vinejs/vine'

export const registerUserValidator = vine.compile(
  vine.object({
    first_name: vine.string().trim().minLength(3),
    last_name: vine.string().trim().minLength(3),
    email: vine
      .string()
      .trim()
      .email()
      .unique(async (db, value) => {
        const user = await db.from('users').where('email', value).first()
        return !user
      }),
    phone_number: vine
      .string()
      .trim()
      .minLength(11)
      .unique(async (db, value) => {
        const user = await db.from('users').where('phone_number', value).first()
        return !user
      }),

    role_id: vine.number().exists(async (db, value) => {
      const role = await db.from('roles').where('id', value).first()
      return !!role
    }),
  })
)
