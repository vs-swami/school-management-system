'use strict';

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::seat-allocation.seat-allocation', ({ strapi }) => ({
  
  // Auto-assign seat to student
  async autoAssignSeat(studentId, pickupStopId, dropStopId) {
    try {
      // Find buses that serve both pickup and drop stops
      const routes = await strapi.entityService.findMany('api::bus-route.bus-route', {
        filters: {
          bus_stops: { 
            id: { $in: [pickupStopId, dropStopId] }
          }
        },
        populate: {
          bus: {
            populate: {
              seat_allocations: {
                filters: { is_active: true }
              }
            }
          },
          bus_stops: true
        }
      });

      // Filter routes that serve both stops
      const validRoutes = routes.filter(route => {
        const stopIds = route.bus_stops.map(stop => stop.id);
        return stopIds.includes(pickupStopId) && stopIds.includes(dropStopId);
      });

      if (validRoutes.length === 0) {
        throw new Error('No routes found serving both pickup and drop stops');
      }

      // Find bus with available seats
      for (const route of validRoutes) {
        const bus = route.bus;
        const allocatedSeats = bus.seat_allocations.map(alloc => alloc.seat_number);
        const availableSeats = [];
        
        for (let i = 1; i <= bus.total_seats; i++) {
          if (!allocatedSeats.includes(i)) {
            availableSeats.push(i);
          }
        }

        if (availableSeats.length > 0) {
          // Assign the first available seat
          const seatNumber = availableSeats[0];
          
          const allocation = await strapi.entityService.create('api::seat-allocation.seat-allocation', {
            data: {
              bus: bus.id,
              student: studentId,
              seat_number: seatNumber,
              pickup_stop: pickupStopId,
              drop_stop: dropStopId,
              allocation_date: new Date(),
              valid_from: new Date(),
              is_active: true
            },
            populate: {
              bus: true,
              student: true,
              pickup_stop: true,
              drop_stop: true
            }
          });

          return allocation;
        }
      }

      throw new Error('No available seats found on routes serving the specified stops');
    } catch (error) {
      throw new Error(`Error auto-assigning seat: ${error.message}`);
    }
  },

  // Get allocation statistics
  async getAllocationStats() {
    try {
      const allocations = await strapi.entityService.findMany('api::seat-allocation.seat-allocation', {
        filters: { is_active: true },
        populate: {
          bus: true
        }
      });

      const busStats = {};
      let totalAllocations = 0;

      allocations.forEach(allocation => {
        const busId = allocation.bus.id;
        if (!busStats[busId]) {
          busStats[busId] = {
            bus: allocation.bus,
            allocated_seats: 0,
            total_seats: allocation.bus.total_seats
          };
        }
        busStats[busId].allocated_seats++;
        totalAllocations++;
      });

      const stats = Object.values(busStats).map(stat => ({
        ...stat,
        available_seats: stat.total_seats - stat.allocated_seats,
        utilization_percent: Math.round((stat.allocated_seats / stat.total_seats) * 100)
      }));

      return {
        total_allocations: totalAllocations,
        total_buses: stats.length,
        bus_statistics: stats,
        overall_utilization: stats.length > 0 ? 
          Math.round((totalAllocations / stats.reduce((sum, s) => sum + s.total_seats, 0)) * 100) : 0
      };
    } catch (error) {
      throw new Error(`Error getting allocation statistics: ${error.message}`);
    }
  }
}));