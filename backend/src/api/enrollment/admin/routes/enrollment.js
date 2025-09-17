module.exports = [
  {
    method: 'GET',
    path: '/enrollments',
    handler: 'enrollment.findEnrollments',
    config: {
      policies: [],
    },
  },
  {
    method: 'PUT',
    path: '/enrollments/:id/enrollment_status',
    handler: 'enrollment.updateStatus',
    config: {
      policies: [],
    },
  },
];
