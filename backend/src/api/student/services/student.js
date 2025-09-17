'use strict';

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::student.student', ({ strapi }) => ({
  // Repository Pattern Implementation
  async findWithRelations(params = {}) {
    const { filters, populate, ...otherParams } = params;
    
    // DEFAULT populate configuration - this is the key fix!
    const defaultPopulate = [
      'place',
      'caste', 
      'house',
      'guardians',
      'enrollments.academic_year',
      'enrollments.class',
      'enrollments.administration.division',
      'documents.file',
      'exam_results',
    ];
    
    // Use provided populate or fall back to default
    let finalPopulate;
    
    if (populate) {
      // Convert comma-separated populate string to an array for entityService
      finalPopulate = typeof populate === 'string' ? populate.split(',') : populate;
      // Merge with default populate to ensure essential relations are always included
      finalPopulate = Array.from(new Set([...defaultPopulate, ...finalPopulate]));
    } else {
      // Use default populate when none provided
      finalPopulate = defaultPopulate;
    }
    
    console.log('Student Service - findWithRelations: Using populate:', finalPopulate);
    
    return await strapi.entityService.findMany('api::student.student', {
      ...otherParams,
      filters,
      populate: finalPopulate,
    });
  },

  async findOneWithRelations(id, populate = []) {
    // Dynamically build populate to ensure exam_results is always included if requested,
    // or use a comprehensive default if no populate is provided.
    const defaultOnePopulate = [
      'place',
      'caste',
      'house',
      'guardians',
      'enrollments.academic_year',
      'enrollments.class',
      'enrollments.administration.division',
      'documents.file',
      'exam_results', // Ensure exam_results is always populated
    ];

    let finalPopulateOne = Array.isArray(populate) && populate.length > 0 
      ? Array.from(new Set([...defaultOnePopulate, ...populate])) 
      : defaultOnePopulate;
    
    // If populate is a string (e.g., '*'), use it directly or merge thoughtfully.
    // For simplicity, if '*' is passed, we'll just use that.
    if (typeof populate === 'string' && populate === '*') {
      finalPopulateOne = '*';
    } else if (typeof populate === 'string') {
        // If a string like 'exam_results' is passed, merge it
        finalPopulateOne = Array.from(new Set([...defaultOnePopulate, ...populate.split(',')]));
    }

    const student = await strapi.entityService.findOne('api::student.student', id, {
      populate: finalPopulateOne,
    });
    console.log('Student Service Debug: findOneWithRelations result:', JSON.stringify(student, null, 2));
    return student;
  },

  // Alternative approach - you can also modify findWithRelations to handle '*' populate
  async findWithRelationsAlternative(params = {}) {
    const { filters, populate, ...otherParams } = params;
    
    // Handle different populate scenarios
    let finalPopulate;
    
    if (populate === '*') {
      // Use '*' for all fields
      finalPopulate = '*';
    } else if (populate) {
      // Convert comma-separated populate string to an array
      finalPopulate = typeof populate === 'string' ? populate.split(',') : populate;
    } else {
      // Default to all relations when no populate specified
      finalPopulate = '*';
    }
    
    return await strapi.entityService.findMany('api::student.student', {
      ...otherParams,
      filters,
      populate: finalPopulate,
    });
  },

  // Rest of your methods remain the same...
  async createStudent(data) {
    console.log('Student Service - createStudentWithRelations: Received Data (after JSON.parse)', JSON.stringify(data, null, 2));
    const studentData = { ...data }; // Copy all data initially

    // Remove relations from studentData before creating the student
    const guardiansData = studentData.guardians ? [...studentData.guardians] : [];
    delete studentData.guardians;

    const enrollmentsData = studentData.enrollments ? [...studentData.enrollments] : [];
    delete studentData.enrollments;

    console.log('Creating student with data:', studentData);
    
    // 1. Create student first
    const student = await strapi.entityService.create('api::student.student', {
      data: studentData,
    });
    console.log('Student Service - createStudentWithRelations: Successfully created student', JSON.stringify(student, null, 2));

    let createdEnrollment = null;
    // 2. Create enrollments, linking to the newly created student
    if (enrollmentsData.length > 0) {
      const enrollmentInput = enrollmentsData[0]; // Assuming one enrollment per student
      console.log('Student Service - createStudentWithRelations: Processing Enrollment Input', JSON.stringify(enrollmentInput, null, 2));
      try {
        const academicYearId = parseInt(enrollmentInput.academic_year);
        const classId = parseInt(enrollmentInput.class);

        const academicYear = await strapi.entityService.findOne('api::academic-year.academic-year', academicYearId);
        if (!academicYear) {
          throw new Error(`Academic year with ID ${academicYearId} not found.`);
        }

        const grNo = await strapi.service('api::enrollment.enrollment').generateGRNumber(enrollmentInput.class_standard, academicYearId);

        createdEnrollment = await strapi.entityService.create('api::enrollment.enrollment', {
          data: {
            ...enrollmentInput,
            student: student.id, // Link to the newly created student
            academic_year: academicYearId,
            class: classId,
            gr_no: grNo,
            date_enrolled: new Date(enrollmentInput.date_enrolled).toISOString().split('T')[0],
          }
        });
        console.log('Student Service - createStudentWithRelations: Successfully created enrollment', JSON.stringify(createdEnrollment, null, 2));
      } catch (error) {
        console.error('Student Service - createStudentWithRelations: Error creating enrollment', JSON.stringify(enrollmentInput, null, 2), error.message);
        throw error;
      }
    }

    // 3. Update student to link enrollment (if created)
    if (createdEnrollment) {
      await strapi.entityService.update('api::student.student', student.id, {
        data: {
          enrollments: createdEnrollment.id,
        },
      });
      console.log('Student Service - createStudentWithRelations: Successfully linked enrollment to student');
    }

    // Create guardians
    if (guardiansData.length > 0) {
      for (const guardianData of guardiansData) {
        const createdGuardian = await strapi.entityService.create('api::guardian.guardian', {
          data: {
            ...guardianData,
            student: student.id
          }
        });
        
      }
    }

    // Handle student photo upload if it exists
    

    return await this.findOneWithRelations(student.id);
  },

  async updateStudent(studentId, data) {
    // Separate student data from guardian data
    const studentData = { ...data
    };
    const guardiansData = studentData.guardians ? [...studentData.guardians] : [];
    delete studentData.guardians;

    const enrollmentsData = studentData.enrollments ? [...studentData.enrollments] : [];
    delete studentData.enrollments;

    // 1. Update student
    const updatedStudent = await strapi.entityService.update('api::student.student', studentId, {
      data: studentData,
    });

    // 2. Update or create guardians
    for (const guardianData of guardiansData) {
      if (guardianData.id) {
        // Update existing guardian
        await strapi.entityService.update('api::guardian.guardian', guardianData.id, {
          data: {
            ...guardianData,
            student: studentId
          },
        });
      } else {
        // Create new guardian
        await strapi.entityService.create('api::guardian.guardian', {
          data: {
            ...guardianData,
            student: studentId
          },
        });
      }
    }

    // 3. Update or create enrollments
    if (enrollmentsData.length > 0) {
      const enrollmentInput = enrollmentsData[0]; // Assuming one enrollment per student
      try {
        const academicYearId = parseInt(enrollmentInput.academic_year);
        const classId = parseInt(enrollmentInput.class);

        // Check if enrollment exists for this student (assuming one active enrollment for simplicity)
        const existingEnrollments = await strapi.entityService.findMany('api::enrollment.enrollment', {
          filters: { student: studentId },
        });

        if (existingEnrollments.length > 0) {
          // Update existing enrollment
          await strapi.entityService.update('api::enrollment.enrollment', existingEnrollments[0].id, {
            data: {
              ...enrollmentInput,
              student: studentId, // Link to the student
              academic_year: academicYearId,
              class: classId,
              date_enrolled: new Date(enrollmentInput.date_enrolled).toISOString().split('T')[0],
            }
          });
          console.log('Student Service - updateWithGuardians: Successfully updated enrollment');
        } else {
          // Create new enrollment (should not happen in typical update flow if always one enrollment)
          const grNo = await strapi.service('api::enrollment.enrollment').generateGRNumber(enrollmentInput.class_standard, academicYearId);
          await strapi.entityService.create('api::enrollment.enrollment', {
            data: {
              ...enrollmentInput,
              student: studentId, // Link to the student
              academic_year: academicYearId,
              class: classId,
              gr_no: grNo,
              date_enrolled: new Date(enrollmentInput.date_enrolled).toISOString().split('T')[0],
            }
          });
          console.log('Student Service - updateWithGuardians: Successfully created new enrollment during update');
        }
      } catch (error) {
        console.error('Student Service - updateWithGuardians: Error processing enrollment', error.message);
        throw error;
      }
    }

    // Handle student photo upload if it exists during update
    

    return await this.findOneWithRelations(studentId);
  },

  async createStudentDocument(data) {
    console.log('Creating student-document with data:', data);
    try {
      const entry = await strapi.entityService.create('api::student-document.student-document', {
        data,
      });
      console.log('Student-document created:', entry);
      return entry;
    } catch (error) {
      console.error('Error creating student-document:', error);
      throw error;
    }
  },

  async deleteStudentDocument(documentId) {
    console.log('Deleting student-document with ID:', documentId);
    try {
      const deletedEntry = await strapi.entityService.delete('api::student-document.student-document', documentId);
      console.log('Student-document deleted:', deletedEntry);
      return deletedEntry;
    } catch (error) {
      console.error('Error deleting student-document:', error);
      throw error;
    }
  },

  async getStatistics() {
    // Example: Count total students
    const studentCount = await strapi.entityService.count('api::student.student');

    // Example: Count enrollments by academic year
    const enrollmentsByAcademicYear = await strapi.db.query('api::enrollment.enrollment').findMany({
      select: ['academic_year'],
      groupBy: ['academic_year'],
      // _count: { id: true },
    });

    return {
      studentCount,
      enrollmentsByAcademicYear,
    };
  },
}));