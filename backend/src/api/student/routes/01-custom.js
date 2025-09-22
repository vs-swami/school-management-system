'use strict';

/**
 * Custom student routes
 */

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/students/documents',
      handler: 'api::student.student.uploadDocument',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ]
};