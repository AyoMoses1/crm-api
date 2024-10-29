import Appointment from '#models/appointment'

export const scheduleAppointment = async (payload: any, trx: any) => {
  const appointment = await Appointment.create(payload, { client: trx })
  return appointment
}

export const rescheduleAppointment = async (appointmentId: number, payload: any) => {
  const appointment = await Appointment.find(appointmentId)

  if (!appointment) {
    return null
  }

  appointment.merge(payload)
  await appointment.save()

  return appointment
}

export const cancelAppointment = async (appointmentId: number) => {
  const appointment = await Appointment.find(appointmentId)

  if (!appointment) {
    return null
  }

  appointment.status = 'cancelled'
  await appointment.save()

  return appointment
}
