'use strict';

/**
 * Custom class routes
 * File: src/api/class/routes/01-custom.js
 */

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/classes/summary',
      handler: 'api::class.class.findAllWithSummary',
      config: {
        // Remove auth property to use default authentication requirement
        // Or use: auth: { scope: ['api::class.class.findAllWithSummary'] }
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/classes/:id/stats',
      handler: 'api::class.class.findWithStats',
      config: {
        // Remove auth property to use default authentication requirement
        // Or use: auth: { scope: ['api::class.class.findWithStats'] }
        policies: [],
        middlewares: [],
      },
    }
  ]
};