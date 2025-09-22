'use strict';

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::bus.bus', ({ strapi }) => ({
  
  // Find buses with available seats
  async findBusesWithAvailableSeats(minSeats = 1) {
    try {
      const buses = await strapi.entityService.findMany('api::bus.bus', {
        filters: { bus_status: 'active' },
        populate: {
          seat_allocations: {
            filters: { is_active: true }
          }
        }
      });

      const availableBuses = [];
      
      for (const bus of buses) {
        const allocatedSeats = bus.seat_allocations.length;
        const availableSeats = bus.total_seats - allocatedSeats;
        
        if (availableSeats >= minSeats) {
          availableBuses.push({
            ...bus,
            available_seats: availableSeats,
            allocated_seats: allocatedSeats
          });
        }
      }

      return availableBuses;
    } catch (error) {
      throw new Error(`Error finding available buses: ${error.message}`);
    }
  },

}));
