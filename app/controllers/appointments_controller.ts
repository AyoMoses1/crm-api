import {
  scheduleAppointment,
  rescheduleAppointment,
  cancelAppointment,
} from '#modules/appointment/index'
import { sendErrorResponse, sendSuccessResponse } from '#utils/index'
import {
  scheduleAppointmentValidator,
  rescheduleAppointmentValidator,
} from '#validators/appointment'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

export default class AppointmentsController {
  // Schedule an appointment
  async scheduleAppointment({ request, response }: HttpContext) {
    await db.transaction(async (trx) => {
      const payload = await request.validateUsing(scheduleAppointmentValidator)

      const appointment = await scheduleAppointment(payload, trx)

      if (appointment.$isPersisted) {
        sendSuccessResponse(response, 'Appointment scheduled successfully', appointment)
      } else {
        return sendErrorResponse(response, 422, 'Failed to schedule appointment.')
      }
    })
  }

  // Reschedule an appointment
  async rescheduleAppointment({ request, params, response }: HttpContext) {
    const appointmentId = params.id

    // await db.transaction(async (trx) => {
    const payload = await request.validateUsing(rescheduleAppointmentValidator)

    const appointment = await rescheduleAppointment(appointmentId, payload)

    if (appointment) {
      sendSuccessResponse(response, 'Appointment rescheduled successfully', appointment)
    } else {
      return sendErrorResponse(response, 404, 'Appointment not found.')
    }
    // })
  }

  // Cancel an appointment
  async cancelAppointment({ params, response }: HttpContext) {
    const appointmentId = params.id

    // await db.transaction(async (trx) => {
    const appointment = await cancelAppointment(appointmentId)

    if (appointment) {
      sendSuccessResponse(response, 'Appointment cancelled successfully', appointment)
    } else {
      return sendErrorResponse(response, 404, 'Appointment not found.')
    }
    // })
  }
}
