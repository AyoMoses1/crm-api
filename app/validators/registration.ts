import vine from '@vinejs/vine'

export const registerUserValidator = vine.compile(
  vine.object({
    first_name: vine.string().trim().minLength(3),
    last_name: vine.string().trim().minLength(3),
    gender: vine.enum(['male', 'female', 'other']),
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
    school_id: vine.number().exists(async (db, value) => {
      const school = await db.from('schools').where('id', value).first()
      return !!school
    }),
    role_id: vine.number().exists(async (db, value) => {
      const school = await db.from('roles').where('id', value).first()
      return !!school
    }),
    is_student: vine.boolean(),
  })
)

export const registerExecutiveValidator = vine.compile(
  vine.object({
    first_name: vine.string().trim().minLength(3),
    last_name: vine.string().trim().minLength(3),
    gender: vine.enum(['male', 'female', 'other']),
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
  })
)

export const studentValidator = vine.compile(
  vine.object({
    matric_number: vine.string().trim().minLength(3),
    department_id: vine.number().min(1),
    year_of_enrollment: vine.number().min(1900).max(new Date().getFullYear()),
    current_level: vine.string().trim().minLength(1),
  })
)
