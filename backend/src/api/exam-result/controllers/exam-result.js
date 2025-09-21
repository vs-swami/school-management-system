'use strict';

/**
 * exam-result controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::exam-result.exam-result', ({ strapi }) => ({
  
  // Override default find to include custom population
  async find(ctx) {
    const { query } = ctx;

    const entity = await strapi.entityService.findMany('api::exam-result.exam-result', {
      ...query,
      populate: {
        student: true,
        academic_year: true,
        class: true,
        subject_scores: true // Add component population
      }
    });

    const sanitizedEntity = await this.sanitizeOutput(entity, ctx);
    return this.transformResponse(sanitizedEntity);
  },

  // Override default findOne to include custom population
  async findOne(ctx) {
    const { id } = ctx.params;
    const { query } = ctx;

    const entity = await strapi.entityService.findOne('api::exam-result.exam-result', id, {
      ...query,
      populate: {
        student: true,
        academic_year: true,
        class: true,
        subject_scores: true // Add component population
      }
    });

    const sanitizedEntity = await this.sanitizeOutput(entity, ctx);
    return this.transformResponse(sanitizedEntity);
  },

  // Override default create to auto-calculate fields
  async create(ctx) {
    const { data } = ctx.request.body;

    // Auto-calculate pass/fail and grade if not provided
    if (data.marks_obtained !== undefined && data.total_marks !== undefined) {
      const percentage = (data.marks_obtained / data.total_marks) * 100;
      
      // Auto-set pass/fail if not provided
      if (data.pass_fail === undefined) {
        data.pass_fail = percentage >= 40; // 40% passing grade
      }
      
      // Auto-set grade if not provided
      if (!data.grade) {
        if (percentage >= 90) data.grade = 'A+';
        else if (percentage >= 80) data.grade = 'A';
        else if (percentage >= 70) data.grade = 'B';
        else if (percentage >= 60) data.grade = 'C';
        else if (percentage >= 40) data.grade = 'D';
        else data.grade = 'F';
      }
    }

    const entity = await strapi.entityService.create('api::exam-result.exam-result', {
      data,
      populate: {
        student: true,
        academic_year: true,
        class: true,
        subject_scores: true // Add component population
      }
    });

    const sanitizedEntity = await this.sanitizeOutput(entity, ctx);
    return this.transformResponse(sanitizedEntity);
  },

  // Override default update to auto-calculate fields
  async update(ctx) {
    const { id } = ctx.params;
    const { data } = ctx.request.body;

    // Auto-calculate pass/fail and grade if marks are updated
    if (data.marks_obtained !== undefined || data.total_marks !== undefined) {
      // Get current data to ensure we have both marks values
      const currentEntity = await strapi.entityService.findOne('api::exam-result.exam-result', id);
      
      const marksObtained = data.marks_obtained !== undefined ? data.marks_obtained : currentEntity.marks_obtained;
      const totalMarks = data.total_marks !== undefined ? data.total_marks : currentEntity.total_marks;
      
      if (marksObtained !== undefined && totalMarks !== undefined) {
        const percentage = (marksObtained / totalMarks) * 100;
        
        // Auto-update pass/fail if not explicitly provided
        if (data.pass_fail === undefined) {
          data.pass_fail = percentage >= 40;
        }
        
        // Auto-update grade if not explicitly provided
        if (!data.grade) {
          if (percentage >= 90) data.grade = 'A+';
          else if (percentage >= 80) data.grade = 'A';
          else if (percentage >= 70) data.grade = 'B';
          else if (percentage >= 60) data.grade = 'C';
          else if (percentage >= 40) data.grade = 'D';
          else data.grade = 'F';
        }
      }
    }

    const entity = await strapi.entityService.update('api::exam-result.exam-result', id, {
      data,
      populate: {
        student: true,
        academic_year: true,
        class: true,
        subject_scores: true // Add component population
      }
    });

    const sanitizedEntity = await this.sanitizeOutput(entity, ctx);
    return this.transformResponse(sanitizedEntity);
  },

  // Custom action: Approve student for next stage
  async approveStudentForNextStage(ctx) {
    const { studentId, examResultId } = ctx.request.body;

    if (!studentId) {
      return ctx.badRequest('Student ID is required.');
    }

    try {
      const student = await strapi.entityService.findOne('api::student.student', studentId, {
        populate: {
          enrollments: {
            populate: {
              class: true,
              academic_year: true,
              administration: {
                populate: {
                  division: true
                }
              }
            }
          }
        }
      });

      console.log('Approve Student: Fetched student:', JSON.stringify(student, null, 2));

      if (!student) {
        return ctx.notFound('Student not found.');
      }

      // Find the current/active enrollment
      const enrollments = Array.isArray(student.enrollments) ? student.enrollments : (student.enrollments ? [student.enrollments] : []);
      console.log('Approve Student: Total enrollments found:', enrollments.length);

      // Look for active enrollment with various status options
      const currentEnrollment = enrollments.find(enrollment =>
        enrollment && (
          enrollment.enrollment_status === 'Processing' ||
          enrollment.enrollment_status === 'Enrolled' ||
          enrollment.enrollment_status === 'Enquiry' ||
          enrollment.is_current === true
        )
      ) || enrollments?.[0]; // fallback to first enrollment

      console.log('Approve Student: Current Enrollment:', JSON.stringify(currentEnrollment, null, 2));

      if (!currentEnrollment) {
        return ctx.badRequest('Student has no enrollment records.');
      }

      if (!currentEnrollment.class) {
        console.log('Approve Student: Enrollment found but class is missing:', currentEnrollment);
        return ctx.badRequest('Student enrollment has no associated class information.');
      }

      const currentClass = currentEnrollment.class.classname;
      const earlyYearsClasses = ['Nursery', 'LKG', 'UKG'];

      if (earlyYearsClasses.includes(currentClass)) {
        // Update enrollment status to 'Enrolled' for early years classes
        await strapi.entityService.update('api::enrollment.enrollment', currentEnrollment.id, {
          data: { enrollment_status: 'Enrolled' },
        });
        console.log(`Student in ${currentClass} enrollment status updated to Enrolled (automatically approved).`);
        
        // Skip approval for early years classes
        return ctx.send({
          message: `Student in ${currentClass} is automatically approved for the next stage (skip).`,
          studentId,
          skipped: true,
          enrollmentStatusUpdated: true,
        });
      }

      // If no specific exam result, check all recent exam results (original logic remains similar)
      const studentExamResults = await strapi.entityService.findMany('api::exam-result.exam-result', {
        filters: { student: studentId },
        populate: ['academic_year', 'class', 'subject_scores'],
        sort: { createdAt: 'desc' }
      });

      if (!studentExamResults || studentExamResults.length === 0) {
        return ctx.badRequest('No exam results found for this student.');
      }

      // Comprehensive approval logic
      const passingResults = studentExamResults.filter(result => 
        result.pass_fail === true || (result.marks_obtained / result.total_marks) * 100 >= 40
      );
      
      const totalSubjects = studentExamResults.length;
      const passedSubjects = passingResults.length;
      const overallApproval = passedSubjects === totalSubjects; // All subjects must pass

      // Calculate overall percentage
      const totalMarksObtained = studentExamResults.reduce((sum, result) => sum + result.marks_obtained, 0);
      const totalMaxMarks = studentExamResults.reduce((sum, result) => sum + result.total_marks, 0);
      const overallPercentage = totalMaxMarks > 0 ? (totalMarksObtained / totalMaxMarks) * 100 : 0;

      if (overallApproval) {
        // Update enrollment status to 'Enrolled'
        await strapi.entityService.update('api::enrollment.enrollment', currentEnrollment.id, {
          data: { enrollment_status: 'Enrolled' },
        });
        console.log(`Student ${student.gr_full_name} enrollment status updated to Enrolled.`);
      }

      return ctx.send({
        message: `Student ${student.gr_full_name || student.name} ${overallApproval ? 'approved' : 'not approved'} for next stage based on exam results.`,
        studentId,
        approved: overallApproval,
        examResultsCount: totalSubjects,
        passedSubjects,
        failedSubjects: totalSubjects - passedSubjects,
        overallPercentage: Math.round(overallPercentage * 100) / 100,
        enrollmentStatusUpdated: overallApproval, // Indicate if status was updated
      });

    } catch (error) {
      strapi.log.error(`Error in approveStudentForNextStage: ${error.message}`);
      return ctx.internalServerError('An error occurred during student stage approval.', { 
        error: error.message 
      });
    }
  },

  // Custom action: Bulk create/update exam results
  async bulkCreateOrUpdate(ctx) {
    const { studentId } = ctx.params;
    const { examResults } = ctx.request.body;

    if (!studentId || !examResults || !Array.isArray(examResults)) {
      return ctx.badRequest('Student ID and an array of exam results are required.');
    }

    try {
      const examResultService = strapi.service('api::exam-result.exam-result');
      const results = await examResultService.createOrUpdateBulk(studentId, examResults);
      
      return ctx.send({ 
        success: true, 
        data: results,
        message: `Successfully processed ${examResults.length} exam results for student ${studentId}`
      });
    } catch (error) {
      strapi.log.error(`Error in bulkCreateOrUpdate: ${error.message}`);
      return ctx.internalServerError('An error occurred during bulk exam results update.', { 
        error: error.message 
      });
    }
  },

  // Custom action: Get student performance summary
  async getStudentPerformance(ctx) {
    const { studentId } = ctx.params;
    const { academicYear, classId } = ctx.query;

    if (!studentId) {
      return ctx.badRequest('Student ID is required.');
    }

    try {
      const examResultService = strapi.service('api::exam-result.exam-result');
      const performance = await examResultService.calculateOverallPerformance(
        studentId, 
        academicYear, 
        classId
      );
      
      return ctx.send(performance);
    } catch (error) {
      strapi.log.error(`Error in getStudentPerformance: ${error.message}`);
      return ctx.internalServerError('An error occurred while calculating student performance.', { 
        error: error.message 
      });
    }
  }

}));