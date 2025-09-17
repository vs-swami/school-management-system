'use strict';

/**
 * bus-route controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::bus-route.bus-route', ({ strapi }) => ({
  
  // Get all routes with populated data
  async find(ctx) {
    ctx.query.populate = ctx.query.populate || {
      bus: true,
      bus_stops: true
    };
    return await super.find(ctx);
  },

  // Get route with ordered stops
  async findOne(ctx) {
    const { id } = ctx.params;
    
    try {
      const route = await strapi.entityService.findOne('api::bus-route.bus-route', id, {
        populate: {
          bus: true,
          bus_stops: true
        }
      });

      if (!route) {
        return ctx.notFound('Route not found');
      }

      // Order stops according to stop_order array
      if (route.stop_order && Array.isArray(route.stop_order)) {
        const orderedStops = route.stop_order.map(stopId => 
          route.bus_stops.find(stop => stop.id === stopId)
        ).filter(Boolean);
        
        route.ordered_stops = orderedStops;
      }

      return route;
    } catch (error) {
      console.error('Error finding route:', error);
      return ctx.internalServerError('Error fetching route');
    }
  },

  // Get routes by bus
  async findByBus(ctx) {
    const { busId } = ctx.params;
    
    try {
      const routes = await strapi.entityService.findMany('api::bus-route.bus-route', {
        filters: { bus: busId },
        populate: {
          bus_stops: true
        }
      });

      return routes;
    } catch (error) {
      console.error('Error finding routes by bus:', error);
      return ctx.internalServerError('Error fetching bus routes');
    }
  },

  // Get routes serving a specific stop
  async findByStop(ctx) {
    const { stopId } = ctx.params;
    
    try {
      const routes = await strapi.service('api::bus-route.bus-route').findByStop(stopId);
      return routes;
    } catch (error) {
      console.error('Error finding routes by stop:', error);
      return ctx.internalServerError('Error fetching routes for stop');
    }
  },

  // Update stop order for a route
  async updateStopOrder(ctx) {
    const { id } = ctx.params;
    const { stopOrder } = ctx.request.body;
    
    if (!Array.isArray(stopOrder)) {
      return ctx.badRequest('Stop order must be an array of stop IDs');
    }

    try {
      const route = await strapi.entityService.findOne('api::bus-route.bus-route', id, {
        populate: { bus_stops: true }
      });

      if (!route) {
        return ctx.notFound('Route not found');
      }

      // Validate that all stop IDs in the order exist in the route
      const routeStopIds = route.bus_stops.map(stop => stop.id);
      const invalidStops = stopOrder.filter(stopId => !routeStopIds.includes(stopId));
      
      if (invalidStops.length > 0) {
        return ctx.badRequest(`Invalid stop IDs: ${invalidStops.join(', ')}`);
      }

      const updated = await strapi.entityService.update('api::bus-route.bus-route', id, {
        data: { stop_order: stopOrder },
        populate: {
          bus: true,
          bus_stops: true
        }
      });

      return updated;
    } catch (error) {
      console.error('Error updating stop order:', error);
      return ctx.internalServerError('Error updating stop order');
    }
  },

  // Get route schedule
  async getSchedule(ctx) {
    const { id } = ctx.params;
    
    try {
      const route = await strapi.entityService.findOne('api::bus-route.bus-route', id, {
        populate: {
          bus: true,
          bus_stops: true
        }
      });

      if (!route) {
        return ctx.notFound('Route not found');
      }

      // Create schedule with estimated times for each stop
      const schedule = {
        route_id: route.id,
        route_name: route.route_name,
        bus: route.bus,
        departure_time: route.departure_time,
        arrival_time: route.arrival_time,
        stops: []
      };

      if (route.stop_order && route.estimated_duration) {
        const timePerStop = route.estimated_duration / route.stop_order.length;
        
        route.stop_order.forEach((stopId, index) => {
          const stop = route.bus_stops.find(s => s.id === stopId);
          if (stop) {
            const estimatedTime = this.addMinutesToTime(route.departure_time, timePerStop * index);
            schedule.stops.push({
              ...stop,
              order: index + 1,
              estimated_arrival: estimatedTime
            });
          }
        });
      }

      return schedule;
    } catch (error) {
      console.error('Error getting route schedule:', error);
      return ctx.internalServerError('Error fetching route schedule');
    }
  },

  // Helper function to add minutes to time
  addMinutesToTime(timeString, minutes) {
    const [hours, mins] = timeString.split(':').map(Number);
    const totalMinutes = hours * 60 + mins + minutes;
    const newHours = Math.floor(totalMinutes / 60) % 24;
    const newMins = totalMinutes % 60;
    return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
  }

}));