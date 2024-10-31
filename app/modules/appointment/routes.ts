import router from '@adonisjs/core/services/router'
const AppointmentsController = () => import('#controllers/appointments_controller')

router
  .group(() => {
    router.post('/appointments', [AppointmentsController, 'scheduleAppointment'])
    router.get('/appointments', [AppointmentsController, 'fetchAppointments'])
    router.put('/appointments/:id', [AppointmentsController, 'rescheduleAppointment'])
    router.delete('/appointments/:id', [AppointmentsController, 'cancelAppointment'])
  })
  .prefix('/api/v1')
