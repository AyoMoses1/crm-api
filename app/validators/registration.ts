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
    avatar: vine.file(),
  })
)

export const addClientValidator = vine.compile(
  vine.object({
    first_name: vine.string().trim().minLength(3),
    last_name: vine.string().trim().minLength(3),
    email: vine
      .string()
      .trim()
      .email()
      .unique(async (db, value) => {
        const client = await db.from('clients').where('email', value).first()
        return !client
      }),
    phone_number: vine
      .string()
      .trim()
      .minLength(11)
      .unique(async (db, value) => {
        const client = await db.from('clients').where('phone_number', value).first()
        return !client
      }),
    country: vine.string().trim().minLength(3),
    company: vine.string().trim().minLength(3).optional(),
    address: vine.string().trim().minLength(3),
    state: vine.string().trim().minLength(3),
    avatar: vine.file(),
  })
)

export const updateClientValidator = vine.compile(
  vine.object({
    first_name: vine.string().trim().minLength(3).optional(),
    last_name: vine.string().trim().minLength(3).optional(),
    phone_number: vine
      .string()
      .trim()
      .minLength(11)

      .unique(async (db, value) => {
        const client = await db.from('clients').where('phone_number', value).first()
        return !client
      })
      .optional(),
    country: vine.string().trim().minLength(3).optional(),
    company: vine.string().trim().minLength(3).optional(),
    address: vine.string().trim().minLength(3).optional(),
    state: vine.string().trim().minLength(3).optional(),
  })
)

export const updateUserValidator = vine.compile(
  vine.object({
    first_name: vine.string().trim(),
    last_name: vine.string().trim(),
    role_id: vine
      .number()
      .exists(async (db, value) => {
        const role = await db.from('roles').where('id', value).first()
        return !!role
      })
      .optional(),
    avatar: vine
      .file({
        size: '5mb',
        extnames: ['jpg', 'jpeg', 'png'],
      })
      .optional(),
  })
)
