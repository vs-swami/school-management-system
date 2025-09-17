'use strict';

/**
 * class controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::class.class', ({ strapi }) => ({
  async find(ctx) {
    // Ensure a default sort if none is provided
    if (!ctx.query.sort) {
      ctx.query.sort = 'classname:asc'; // Default sort by classname ascending
    }

    const { data, meta } = await super.find(ctx);
    return { data, meta };
  },
}));
