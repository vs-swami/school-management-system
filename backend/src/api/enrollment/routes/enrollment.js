module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/enrollments',
      handler: 'enrollment.findEnrollments',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/enrollments/:id/enrollment_status',
      handler: 'enrollment.updateStatus',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
