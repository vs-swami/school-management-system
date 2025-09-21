'use strict';

/**
 * Custom routes for exam-result
 */

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/exam-results/approve-student',
      handler: 'exam-result.approveStudentForNextStage',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/exam-results/student/:studentId/bulk',
      handler: 'exam-result.bulkCreateOrUpdate',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/exam-results/student/:studentId/performance',
      handler: 'exam-result.getStudentPerformance',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
};