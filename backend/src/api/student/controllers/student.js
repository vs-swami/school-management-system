'use strict';

const { createCoreController } = require('@strapi/strapi').factories;
// Temporarily commented out to fix startup issue
// const { validate, schemas } = require('../../../middlewares/validation');
// const { logger, auditLog, performanceLog } = require('../../../middlewares/logger');

module.exports = createCoreController('api::student.student', ({ strapi }) => ({
  // Command Pattern Implementation
  async find(ctx) {
    const startTime = Date.now();
    const { query } = ctx;

    try {
      // logger.info('Finding students', {
      //   query: JSON.stringify(query),
      //   userId: ctx.state.user?.id,
      // });

      const students = await strapi.service('api::student.student').findWithRelations(query);

      // const duration = Date.now() - startTime;
      // performanceLog('students.find', duration, {
      //   resultCount: Array.isArray(students) ? students.length : 1,
      //   query: JSON.stringify(query),
      // });

      return this.transformResponse(students);
    } catch (error) {
      // logger.error('Error finding students', {
      //   error: error.message,
      //   stack: error.stack,
      //   query: JSON.stringify(query),
      //   userId: ctx.state.user?.id,
      // });

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
    const startTime = Date.now();

    try {
      // Apply validation middleware
      // const validationMiddleware = validate(schemas.student);
      // await validationMiddleware(ctx, async () => {});

      const { data } = ctx.request.body;
      const { files } = ctx.request;

      // logger.info('Creating student', {
      //   hasFiles: Boolean(files && Object.keys(files).length > 0),
      //   userId: ctx.state.user?.id,
      //   dataKeys: data ? Object.keys(data) : [],
      // });

      const student = await strapi.service('api::student.student').createStudent(data);

      // const duration = Date.now() - startTime;
      // performanceLog('students.create', duration, {
      //   studentId: student.id,
      //   hasEnrollments: Boolean(student.enrollments?.length),
      //   hasGuardians: Boolean(student.guardians?.length),
      // });

      // Audit log for student creation
      // auditLog('STUDENT_CREATED', {
      //   studentId: student.id,
      //   studentName: student.gr_full_name,
      //   grNo: student.enrollments?.[0]?.gr_no,
      // }, ctx.state.user);

      let transformedResponse;
      try {
        transformedResponse = this.transformResponse(student);
        console.log('Controller Create - Transformed response:', JSON.stringify(transformedResponse, null, 2));
      } catch (transformError) {
        console.error('Controller Create - Error during transformResponse:', transformError);
        return ctx.badRequest('Error transforming response', { error: transformError.message, details: transformError });
      }

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
      
      return transformedResponse;
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
      
      const updatedStudent = await strapi.service('api::student.student').updateStudent(id, data);
      
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
  },

  async uploadDocument(ctx) {
    const { data } = ctx.request.body;
    const { files } = ctx.request;
    
    console.log('Controller uploadDocument - Raw ctx.request.body:', ctx.request.body);
    console.log('Controller uploadDocument - Raw ctx.request.files:', ctx.request.files);
    console.log('Controller uploadDocument - Parsed Data:', data);
    console.log('Controller uploadDocument - Files:', files);

    try {
      let parsedData;
      try {
        parsedData = typeof data === 'string' ? JSON.parse(data) : data;
      } catch (parseError) {
        return ctx.badRequest('Invalid JSON in data field', { error: parseError.message });
      }

      // Handle file upload first if files exist
      let fileId = null;
      if (files && Object.keys(files).length > 0) {
        const fileToUpload = files.files || files.file || Object.values(files)[0];
        
        if (fileToUpload) {
          const uploadedFiles = await strapi.plugins.upload.services.upload.upload({
            data: {},
            files: fileToUpload,
          });
          
          if (uploadedFiles && uploadedFiles.length > 0) {
            fileId = uploadedFiles[0].id;
          }
        }
      }

      // Create student document with file ID
      const documentData = {
        ...parsedData,
        ...(fileId && { file: fileId }),
      };

      const studentDocument = await strapi.service('api::student.student').createStudentDocument(documentData);
      
      return this.transformResponse(studentDocument);
    } catch (error) {
      console.error('Student Controller - uploadDocument: Error', error);
      return ctx.badRequest('Error uploading document', { error: error.message });
    }
  },

  // NEW: Proxy controller to handle exam results creation/update for a specific student
  async proxyCreateOrUpdateExamResults(ctx) {
    console.log('proxyCreateOrUpdateExamResults controller hit!'); // DEBUG
    const { studentId } = ctx.params;
    const { examResults } = ctx.request.body;

    if (!studentId || !examResults || !Array.isArray(examResults)) {
      return ctx.badRequest('Student ID and an array of exam results are required.');
    }

    try {
      const results = await strapi.service('api::exam-result.exam-result').createOrUpdateBulk(studentId, examResults);
      return ctx.send({ success: true, data: results });
    } catch (error) {
      strapi.log.error(`Error in proxyCreateOrUpdateExamResults: ${error.message}`);
      return ctx.internalServerError('An error occurred during bulk exam results update.', { error: error.message });
    }
  },
}));