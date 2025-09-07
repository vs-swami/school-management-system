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
    const { data } = ctx.request.body;
    const { files } = ctx.request;
    console.log('Controller Create - Full ctx.request:', ctx.request);
    console.log('Controller Create - Raw ctx.request.body:', ctx.request.body);
    console.log('Controller Create - Raw ctx.request.files:', ctx.request.files);
    console.log('Controller Create - Parsed Data:', data);
    console.log('Controller Create - Files:', files);

    try {
      const student = await strapi.service('api::student.student').createStudentWithRelations(JSON.parse(data), files);
      
      // Log activity
      // TODO: Re-implement audit logging once the audit-log service is available
      /*
      await strapi.service('api::audit-log.audit-log').create({
        data: {
          action: 'CREATE_STUDENT',
          entity: 'student',
          entity_id: student.id,
          user: ctx.state.user?.id,
          details: `Created student: ${student.gr_full_name}`
        }
      });
      */
      
      return this.transformResponse(student);
    } catch (error) {
      return ctx.badRequest('Error creating student', { error: error.message });
    }
  },

  async update(ctx) {
    const { id } = ctx.params;
    const { data } = ctx.request.body;
    const { files } = ctx.request;
    console.log('Controller Update - Full ctx.request:', ctx.request);
    console.log('Controller Update - Raw ctx.request.body:', ctx.request.body);
    console.log('Controller Update - Raw ctx.request.files:', ctx.request.files);

    console.log('Controller Update - Parsed Data:', data);
    console.log('Controller Update - Files:', files);

    try {
      const oldStudent = await strapi.service('api::student.student').findOneWithRelations(id);
      
      const updatedStudent = await strapi.service('api::student.student').updateWithGuardians(id, JSON.parse(data), files);
      
      // Log activity
      // TODO: Re-implement audit logging once the audit-log service is available
      /*
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
      */
      
      return this.transformResponse(updatedStudent);
    } catch (error) {
      console.error('Student Controller - Update: Error during update', error); // Log the full error object
      return ctx.badRequest('Error updating student', { error: error.message, details: error.details });
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