'use strict';

/**
 * bus controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::bus.bus', ({ strapi }) => ({
  
  // Get all buses with routes and seat allocations
  async find(ctx) {
    ctx.query.populate = ctx.query.populate || {
      bus_routes: {
        populate: {
          bus_stops: true
        }
      },
      seat_allocations: {
        populate: {
          enrollment_administration: {
            populate: {
              enrollment: {
                populate: {
                  student: true
                }
              }
            }
          },
          pickup_stop: true
        }
      }
    };
    return await super.find(ctx);
  },

  // Get single bus with full details
  async findOne(ctx) {
    ctx.query.populate = {
      bus_routes: {
        populate: {
          bus_stops: true
        }
      },
      seat_allocations: {
        populate: {
          enrollment_administration: {
            populate: {
              enrollment: {
                populate: {
                  student: true
                }
              }
            }
          },
          pickup_stop: true
        }
      }
    };
    return await super.findOne(ctx);
  },

  // Get available seats for a bus
  async getAvailableSeats(ctx) {
    const { id } = ctx.params;
    
    try {
      const bus = await strapi.entityService.findOne('api::bus.bus', id, {
        populate: {
          seat_allocations: {
            filters: { is_active: true }
          }
        }
      });

      if (!bus) {
        return ctx.notFound('Bus not found');
      }

      const allocatedSeats = bus.seat_allocations.map(allocation => allocation.seat_number);
      const availableSeats = [];
      
      for (let i = 1; i <= bus.total_seats; i++) {
        if (!allocatedSeats.includes(i)) {
          availableSeats.push(i);
        }
      }

      return {
        bus_id: bus.id,
        bus_number: bus.bus_number,
        total_seats: bus.total_seats,
        allocated_seats: allocatedSeats.length,
        available_seats: availableSeats.length,
        available_seat_numbers: availableSeats,
        allocated_seat_numbers: allocatedSeats.sort((a, b) => a - b)
      };
    } catch (error) {
      console.error('Error getting available seats:', error);
      return ctx.internalServerError('Error calculating available seats');
    }
  },

  // Get bus utilization statistics
  async getBusUtilization(ctx) {
    try {
      const buses = await strapi.entityService.findMany('api::bus.bus', {
        populate: {
          seat_allocations: {
            filters: { is_active: true }
          }
        }
      });

      const utilization = buses.map(bus => {
        const allocatedSeats = bus.seat_allocations.length;
        const utilizationPercent = (allocatedSeats / bus.total_seats) * 100;
        
        return {
          bus_id: bus.id,
          bus_number: bus.bus_number,
          driver_name: bus.driver_name,
          total_seats: bus.total_seats,
          allocated_seats: allocatedSeats,
          available_seats: bus.total_seats - allocatedSeats,
          utilization_percent: Math.round(utilizationPercent * 100) / 100,
          status: utilizationPercent >= 90 ? 'FULL' : 
                  utilizationPercent >= 70 ? 'MODERATE' : 'LOW'
        };
      });

      return {
        total_buses: buses.length,
        buses: utilization,
        summary: {
          total_seats: utilization.reduce((sum, bus) => sum + bus.total_seats, 0),
          total_allocated: utilization.reduce((sum, bus) => sum + bus.allocated_seats, 0),
          total_available: utilization.reduce((sum, bus) => sum + bus.available_seats, 0),
          average_utilization: utilization.reduce((sum, bus) => sum + bus.utilization_percent, 0) / utilization.length
        }
      };
    } catch (error) {
      console.error('Error getting bus utilization:', error);
      return ctx.internalServerError('Error calculating bus utilization');
    }
  },

  // Find buses serving a specific stop
  async findByStop(ctx) {
    const { stopId } = ctx.params;
    
    try {
      const routes = await strapi.entityService.findMany('api::bus-route.bus-route', {
        filters: {
          bus_stops: { id: stopId }
        },
        populate: {
          bus: true,
          bus_stops: true
        }
      });

      const buses = routes.map(route => ({
        ...route.bus,
        route: {
          id: route.id,
          route_name: route.route_name,
          departure_time: route.departure_time,
          arrival_time: route.arrival_time
        }
      }));

      return buses;
    } catch (error) {
      console.error('Error finding buses by stop:', error);
      return ctx.internalServerError('Error finding buses for stop');
    }
  }

}));