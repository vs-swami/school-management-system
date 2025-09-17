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

  async findStopsWithRoutes(ctx) {
    try {
      const { id } = ctx.params;
      const entry = await strapi.entityService.findOne('api::bus-stop.bus-stop', id, {
        populate: ['bus_routes'],
      });

      ctx.body = stops.map(stop => ({
        ...stop,
        route_count: stop.bus_routes.length,
        buses: stop.bus_routes.map(route => route.bus)
      }));
    } catch (error) {
      throw new Error(`Error getting stops with routes: ${error.message}`);
    }
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