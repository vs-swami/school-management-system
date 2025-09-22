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
      pickup_stop: true
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
          is_active: true
        }
      });

      if (existingAllocation.length > 0) {
        return ctx.badRequest(`Already allocated on this bus`);
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

      ctx.request.body.data = {
        ...data,
        allocation_date: data.allocation_date || new Date(),
        valid_from: data.valid_from || new Date()
      };

      ctx.query.populate = {
        bus: true,
        student: true,
        pickup_stop: true
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
          pickup_stop: true
        },
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
          pickup_stop: true
        }
      });

      return allocations;
    } catch (error) {
      console.error('Error finding allocations by student:', error);
      return ctx.internalServerError('Error fetching student allocations');
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
          pickup_stop: true
        }
      });

      return updated;
    } catch (error) {
      console.error('Error deactivating allocation:', error);
      return ctx.internalServerError('Error deactivating allocation');
    }
  }

}));