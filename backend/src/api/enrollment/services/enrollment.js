const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::enrollment.enrollment', ({ strapi }) => ({
  async findWithStudent(params = {}) {
    return await strapi.entityService.findMany('api::enrollment.enrollment', {
      ...params,
      populate: [
        'student',
        'academic_year',
        'administration.division',
        'class',
        'admission_type',
      ],
    });
  },

  async generateGRNumber(classStandard, academicYearId) {
    // Get current year code
    const academicYear = await strapi.entityService.findOne('api::academic-year.academic-year', academicYearId);
    const yearCode = academicYear.code.split('-')[0]; // e.g., "2024" from "2024-25"
    
    // Get next sequence number
    const lastEnrollment = await strapi.entityService.findMany('api::enrollment.enrollment', {
      filters: {
        academic_year: academicYearId
      },
      sort: { gr_no: 'desc' },
      limit: 1 // Changed from pagination: { limit: 1 } to limit: 1 for entityService
    });

    let sequence = 1;
    if (lastEnrollment.length > 0) {
      const lastGRNo = lastEnrollment[0].gr_no;
      const lastSequence = parseInt(lastGRNo.slice(-3));
      sequence = lastSequence + 1;
    }

    return `${yearCode}${String(sequence).padStart(3, '0')}`;
  },

  async enrollStudent(data) {
    console.log('🎯 BACKEND: Starting enrollStudent with data:', data);
    const { student_id, academic_year_id, division, date_of_admission, admission_type, ...enrollmentData } = data;

    console.log('📝 BACKEND: Parsed enrollment data:', {
      student_id,
      academic_year_id,
      division,
      date_of_admission,
      admission_type,
      enrollmentData
    });

    // Check if student is already enrolled
    const existingEnrollment = await strapi.entityService.findMany('api::enrollment.enrollment', {
      filters: {
        student: student_id,
        academic_year: academic_year_id
      }
    });

    if (existingEnrollment.length > 0) {
      throw new Error('Student is already enrolled in this academic year');
    }

    // Generate GR number
    const grNo = await this.generateGRNumber(enrollmentData.class_standard, academic_year_id);

    // Create enrollment
    const enrollment = await strapi.entityService.create('api::enrollment.enrollment', {
      data: {
        ...enrollmentData,
        student: student_id,
        academic_year: academic_year_id,
        gr_no: grNo,
        date_enrolled: new Date().toISOString().split('T')[0],
        admission_type: admission_type,
      }
    });

    // Create enrollment administration entry
    console.log('📋 BACKEND: Creating enrollment-administration with:', {
      enrollment: enrollment.id,
      division: division,
      date_of_admission: date_of_admission
    });

    const administrationEntry = await strapi.entityService.create('api::enrollment-administration.enrollment-administration', {
      data: {
        enrollment: enrollment.id,
        division: division,
        date_of_admission: date_of_admission
      }
    });

    console.log('✅ BACKEND: Created enrollment-administration:', administrationEntry);

    return await strapi.entityService.findOne('api::enrollment.enrollment', enrollment.id, {
      populate: {
        student: true,
        academic_year: true,
        class: true,
        administration: {
          populate: {
            division: true,
            seat_allocations: true
          }
        }
      }
    });
  },

  async getEnrollmentStatistics(academicYearId) {
    const enrollments = await strapi.entityService.findMany('api::enrollment.enrollment', {
      filters: {
        academic_year: academicYearId
      }
    });

    const byClass = {};
    const byAdmissionType = {};
    
    enrollments.forEach(enrollment => {
      // By class
      const className = `Class ${enrollment.class_standard}`;
      byClass[className] = (byClass[className] || 0) + 1;
      
      // By admission type
      byAdmissionType[enrollment.admission_type] = (byAdmissionType[enrollment.admission_type] || 0) + 1;
    });

    return {
      total: enrollments.length,
      byClass,
      byAdmissionType
    };
  }
}));