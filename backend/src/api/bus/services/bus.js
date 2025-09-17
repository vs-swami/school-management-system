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

  // Get seat map for a bus
  async getSeatMap(busId) {
    try {
      const bus = await strapi.entityService.findOne('api::bus.bus', busId, {
        populate: {
          seat_allocations: {
            filters: { is_active: true },
            populate: {
              student: {
                fields: ['first_name', 'last_name', 'gr_full_name']
              }
            }
          }
        }
      });

      if (!bus) {
        return null;
      }

      const seatMap = [];
      
      for (let i = 1; i <= bus.total_seats; i++) {
        const allocation = bus.seat_allocations.find(alloc => alloc.seat_number === i);
        
        seatMap.push({
          seat_number: i,
          is_occupied: !!allocation,
          student: allocation ? allocation.student : null,
          allocation_id: allocation ? allocation.id : null
        });
      }

      return {
        bus_id: bus.id,
        bus_number: bus.bus_number,
        total_seats: bus.total_seats,
        seat_map: seatMap
      };
    } catch (error) {
      throw new Error(`Error generating seat map: ${error.message}`);
    }
  }
}));
