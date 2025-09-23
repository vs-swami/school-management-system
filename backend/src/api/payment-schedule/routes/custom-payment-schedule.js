module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/payment-schedules/student/:studentId',
      handler: 'payment-schedule.findByStudent',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/payment-schedules/pending',
      handler: 'payment-schedule.getPending',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/payment-schedules/regenerate/:enrollmentId',
      handler: 'payment-schedule.regenerateSchedule',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/payment-schedules/:scheduleId/summary',
      handler: 'payment-schedule.getScheduleSummary',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/payment-schedules/enrollment/:enrollmentId/preview',
      handler: 'payment-schedule.previewSchedule',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/payment-schedules/enrollment/:enrollmentId/create',
      handler: 'payment-schedule.createSchedule',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/payment-schedules/batch-payment',
      handler: 'payment-schedule.processBatchPayment',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/payment-schedules/generate-all-missing',
      handler: 'payment-schedule.generateAllMissingSchedules',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
};