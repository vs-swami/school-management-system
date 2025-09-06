'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::student.student', ({ strapi }) => ({
  // Command Pattern Implementation
  async find(ctx) {
    const { query } = ctx;
    
    try {
      const students = await strapi.service('api::student.student').findWithRelations(query);
      
      return this.transformResponse(students);
    } catch (error) {
      return ctx.badRequest('Error fetching students', { error: error.message });
    }
  },

  async findOne(ctx) {
    const { id } = ctx.params;
    
    try {
      const student = await strapi.service('api::student.student').findOneWithRelations(id);
      
      if (!student) {
        return ctx.notFound('Student not found');
      }
      
      return this.transformResponse(student);
    } catch (error) {
      return ctx.badRequest('Error fetching student', { error: error.message });
    }
  },

  async create(ctx) {
    console.log('Creating student with data:', ctx.request.body);
    const { data } = ctx.request.body;
    
    try {
      const student = await strapi.service('api::student.student').createWithGuardians(data);
      
      // Log activity
      await strapi.service('api::audit-log.audit-log').create({
        data: {
          action: 'CREATE_STUDENT',
          entity: 'student',
          entity_id: student.id,
          user: ctx.state.user?.id,
          details: `Created student: ${student.gr_full_name}`
        }
      });
      
      return this.transformResponse(student);
    } catch (error) {
      return ctx.badRequest('Error creating student', { error: error.message });
    }
  },

  async update(ctx) {
    const { id } = ctx.params;
    const { data } = ctx.request.body;
    
    try {
      const oldStudent = await strapi.service('api::student.student').findOneWithRelations(id);
      
      const updatedStudent = await strapi.entityService.update('api::student.student', id, {
        data
      });
      
      // Log activity
      await strapi.service('api::audit-log.audit-log').create({
        data: {
          action: 'UPDATE_STUDENT',
          entity: 'student',
          entity_id: id,
          user: ctx.state.user?.id,
          details: `Updated student: ${updatedStudent.gr_full_name}`,
          changes: {
            old: oldStudent,
            new: updatedStudent
          }
        }
      });
      
      return this.transformResponse(updatedStudent);
    } catch (error) {
      return ctx.badRequest('Error updating student', { error: error.message });
    }
  },

  async getStatistics(ctx) {
    try {
      const stats = await strapi.service('api::student.student').getStatistics();
      return stats;
    } catch (error) {
      return ctx.badRequest('Error fetching statistics', { error: error.message });
    }
  }
}));