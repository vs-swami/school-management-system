'use strict';

/**
 * bus-stop controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::bus-stop.bus-stop', ({ strapi }) => ({
  
  // Get all bus stops with route information
  async find(ctx) {
    ctx.query.populate = ctx.query.populate || {
      bus_routes: {
        populate: {
          bus: true
        }
      }
    };
    return await super.find(ctx);
  },

  // Get single bus stop with full details
  async findOne(ctx) {
    ctx.query.populate = {
      bus_routes: {
        populate: {
          bus: true
        }
      },
      pickup_allocations: {
        populate: {
          student: true,
          bus: true
        }
      },
      drop_allocations: {
        populate: {
          student: true,
          bus: true
        }
      }
    };
    return await super.findOne(ctx);
  }

}));