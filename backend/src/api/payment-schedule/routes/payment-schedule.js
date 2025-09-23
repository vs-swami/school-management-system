'use strict';

/**
 * payment-schedule router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::payment-schedule.payment-schedule', {
  config: {
    find: {
      auth: false
    },
    findOne: {
      auth: false
    },
    create: {
      auth: false
    },
    update: {
      auth: false
    },
    delete: {
      auth: false
    }
  }
});