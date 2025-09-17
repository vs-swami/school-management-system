'use strict';

/**
 * Custom exam-result routes
 * File: src/api/exam-result/routes/01-custom.js
 */

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/exam-results/student/:studentId/bulk',
      handler: 'api::exam-result.exam-result.bulkCreateOrUpdate',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/exam-results/approve-student',
      handler: 'api::exam-result.exam-result.approveStudentForNextStage',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/exam-results/student/:studentId/performance',
      handler: 'api::exam-result.exam-result.getStudentPerformance',
     config: {
        policies: [],
        middlewares: [],
      },
    }
  ]
};