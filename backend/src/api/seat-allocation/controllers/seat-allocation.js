'use strict';

/**
 * seat-allocation controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::seat-allocation.seat-allocation', ({ strapi }) => ({
  
  // Get all allocations with populated data
  async find(ctx) {
    ctx.query.populate = ctx.query.populate || {
      bus: true,
      student: true,
      pickup_stop: true,
      drop_stop: true
    };
    return await super.find(ctx);
  },

  // Create allocation with validation
  async create(ctx) {
    const { data } = ctx.request.body;
    
    try {
      // Check if seat is already allocated
      const existingAllocation = await strapi.entityService.findMany('api::seat-allocation.seat-allocation', {
        filters: {
          bus: data.bus,
          seat_number: data.seat_number,
          is_active: true
        }
      });

      if (existingAllocation.length > 0) {
        return ctx.badRequest(`Seat ${data.seat_number} is already allocated on this bus`);
      }

      // Check if student already has an allocation
      const studentAllocation = await strapi.entityService.findMany('api::seat-allocation.seat-allocation', {
        filters: {
          student: data.student,
          is_active: true
        }
      });

      if (studentAllocation.length > 0) {
        return ctx.badRequest('Student already has an active seat allocation');
      }

      // Validate seat number against bus capacity
      const bus = await strapi.entityService.findOne('api::bus.bus', data.bus);
      if (!bus) {
        return ctx.badRequest('Bus not found');
      }

      if (data.seat_number > bus.total_seats) {
        return ctx.badRequest(`Seat number cannot exceed bus capacity of ${bus.total_seats}`);
      }

      ctx.request.body.data = {
        ...data,
        allocation_date: data.allocation_date || new Date(),
        valid_from: data.valid_from || new Date()
      };

      ctx.query.populate = {
        bus: true,
        student: true,
        pickup_stop: true,
        drop_stop: true
      };

      return await super.create(ctx);
    } catch (error) {
      console.error('Error creating seat allocation:', error);
      return ctx.internalServerError('Error creating seat allocation');
    }
  },

  // Get allocations by bus
  async findByBus(ctx) {
    const { busId } = ctx.params;
    
    try {
      const allocations = await strapi.entityService.findMany('api::seat-allocation.seat-allocation', {
        filters: { 
          bus: busId,
          is_active: true 
        },
        populate: {
          student: true,
          pickup_stop: true,
          drop_stop: true
        },
        sort: { seat_number: 'asc' }
      });

      return allocations;
    } catch (error) {
      console.error('Error finding allocations by bus:', error);
      return ctx.internalServerError('Error fetching bus allocations');
    }
  },

  // Get allocations by student
  async findByStudent(ctx) {
    const { studentId } = ctx.params;
    
    try {
      const allocations = await strapi.entityService.findMany('api::seat-allocation.seat-allocation', {
        filters: { 
          student: studentId,
          is_active: true 
        },
        populate: {
          bus: true,
          pickup_stop: true,
          drop_stop: true
        }
      });

      return allocations;
    } catch (error) {
      console.error('Error finding allocations by student:', error);
      return ctx.internalServerError('Error fetching student allocations');
    }
  },

  // Bulk allocate seats
  async bulkAllocate(ctx) {
    const { allocations } = ctx.request.body;
    
    if (!Array.isArray(allocations)) {
      return ctx.badRequest('Allocations must be an array');
    }

    try {
      const results = [];
      const errors = [];

      for (const allocation of allocations) {
        try {
          // Validate each allocation
          const existingAllocation = await strapi.entityService.findMany('api::seat-allocation.seat-allocation', {
            filters: {
              bus: allocation.bus,
              seat_number: allocation.seat_number,
              is_active: true
            }
          });

          if (existingAllocation.length > 0) {
            errors.push(`Seat ${allocation.seat_number} already allocated`);
            continue;
          }

          const created = await strapi.entityService.create('api::seat-allocation.seat-allocation', {
            data: {
              ...allocation,
              allocation_date: allocation.allocation_date || new Date(),
              valid_from: allocation.valid_from || new Date()
            },
            populate: {
              bus: true,
              student: true,
              pickup_stop: true,
              drop_stop: true
            }
          });

          results.push(created);
        } catch (error) {
          errors.push(`Error allocating seat ${allocation.seat_number}: ${error.message}`);
        }
      }

      return {
        success: results.length,
        errors: errors.length,
        results,
        errorMessages: errors
      };
    } catch (error) {
      console.error('Error in bulk allocation:', error);
      return ctx.internalServerError('Error processing bulk allocation');
    }
  },

  // Transfer seat allocation
  async transferSeat(ctx) {
    const { id } = ctx.params;
    const { newStudentId, newSeatNumber } = ctx.request.body;
    
    try {
      const allocation = await strapi.entityService.findOne('api::seat-allocation.seat-allocation', id, {
        populate: { bus: true }
      });

      if (!allocation) {
        return ctx.notFound('Allocation not found');
      }

      // Check if new seat is available (if seat number is changing)
      if (newSeatNumber && newSeatNumber !== allocation.seat_number) {
        const existingAllocation = await strapi.entityService.findMany('api::seat-allocation.seat-allocation', {
          filters: {
            bus: allocation.bus.id,
            seat_number: newSeatNumber,
            is_active: true,
            id: { $ne: id }
          }
        });

        if (existingAllocation.length > 0) {
          return ctx.badRequest(`Seat ${newSeatNumber} is already allocated`);
        }
      }

      const updated = await strapi.entityService.update('api::seat-allocation.seat-allocation', id, {
        data: {
          student: newStudentId || allocation.student,
          seat_number: newSeatNumber || allocation.seat_number
        },
        populate: {
          bus: true,
          student: true,
          pickup_stop: true,
          drop_stop: true
        }
      });

      return updated;
    } catch (error) {
      console.error('Error transferring seat:', error);
      return ctx.internalServerError('Error transferring seat allocation');
    }
  },

  // Deactivate allocation
  async deactivate(ctx) {
    const { id } = ctx.params;
    
    try {
      const updated = await strapi.entityService.update('api::seat-allocation.seat-allocation', id, {
        data: { is_active: false },
        populate: {
          bus: true,
          student: true,
          pickup_stop: true,
          drop_stop: true
        }
      });

      return updated;
    } catch (error) {
      console.error('Error deactivating allocation:', error);
      return ctx.internalServerError('Error deactivating allocation');
    }
  }

}));