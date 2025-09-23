'use strict';

/**
 * payment-item router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::payment-item.payment-item', {
  config: {
    find: {
      policies: [],
      middlewares: []
    },
    findOne: {
      policies: [],
      middlewares: []
    },
    create: {
      policies: [],
      middlewares: []
    },
    update: {
      policies: [],
      middlewares: []
    },
    delete: {
      policies: [],
      middlewares: []
    }
  }
});