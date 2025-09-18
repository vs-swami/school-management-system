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
  },

  // Find stops by Location id (for cascading dropdown)
  async findByLocation(ctx) {
    const { locationId } = ctx.params;
    try {
      const stops = await strapi.entityService.findMany('api::bus-stop.bus-stop', {
        filters: {
          is_active: true,
          location: { id: locationId }
        },
        fields: ['id', 'stop_name'],
        populate: {
          location: { fields: ['id', 'name'] }
        },
        sort: { stop_name: 'asc' }
      });
      return stops;
    } catch (error) {
      console.error('Error finding stops by location:', error);
      return ctx.internalServerError('Error finding stops by location');
    }
  },

  // Get all stops grouped by Location
  async groupedByLocation(ctx) {
    try {
      const stops = await strapi.entityService.findMany('api::bus-stop.bus-stop', {
        filters: { is_active: true },
        fields: ['id', 'stop_name'],
        populate: { location: { fields: ['id', 'name'] } },
        sort: [{ 'location.name': 'asc' }, { stop_name: 'asc' }]
      });

      const groupsMap = new Map();
      for (const stop of stops) {
        const loc = stop.location;
        const key = loc ? String(loc.id) : 'null';
        if (!groupsMap.has(key)) {
          groupsMap.set(key, {
            location: loc ? { id: loc.id, name: loc.name } : null,
            stops: []
          });
        }
        groupsMap.get(key).stops.push({ id: stop.id, stop_name: stop.stop_name });
      }

      return Array.from(groupsMap.values());
    } catch (error) {
      console.error('Error grouping stops by location:', error);
      return ctx.internalServerError('Error grouping stops by location');
    }
  }

}));
