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
      'guardians.contact_numbers',
      'guardians.addresses',
      'enrollments.academic_year',
      'enrollments.class',
      'enrollments.administration.division',
      'enrollments.administration.seat_allocations',
      'enrollments.administration.seat_allocations.pickup_stop',
      'enrollments.administration.seat_allocations.pickup_stop.location',
      'enrollments.administration.seat_allocations.pickup_stop.bus_routes',
      'enrollments.administration.seat_allocations.pickup_stop.bus_routes.bus',
      'enrollments.administration.seat_allocations.bus',
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
      'guardians.contact_numbers',
      'guardians.addresses',
      'enrollments.academic_year',
      'enrollments.class',
      'enrollments.administration.division',
      'enrollments.administration.seat_allocations',
      'enrollments.administration.seat_allocations.pickup_stop',
      'enrollments.administration.seat_allocations.pickup_stop.location',
      'enrollments.administration.seat_allocations.pickup_stop.bus_routes',
      'enrollments.administration.seat_allocations.pickup_stop.bus_routes.bus',
      'enrollments.administration.seat_allocations.bus',
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

    console.log('Creating student with data:', JSON.stringify(studentData, null, 2));
    
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
      console.log('Student Service - createStudent: Creating guardians, count:', guardiansData.length);
      for (const guardianData of guardiansData) {
        // Filter out empty contact numbers and addresses to avoid validation errors
        const processedGuardianData = { ...guardianData };

        // Filter contact_numbers - only keep those with valid numbers
        if (processedGuardianData.contact_numbers) {
          processedGuardianData.contact_numbers = processedGuardianData.contact_numbers.filter(
            contact => contact.number && contact.number.match(/^[+]?[0-9]{10,15}$/)
          );
          // If no valid contact numbers, remove the field entirely
          if (processedGuardianData.contact_numbers.length === 0) {
            delete processedGuardianData.contact_numbers;
          }
        }

        // Filter addresses - only keep those with all required fields
        if (processedGuardianData.addresses) {
          processedGuardianData.addresses = processedGuardianData.addresses.filter(
            addr => addr.address_line1 && addr.city && addr.state &&
                   addr.pincode && addr.pincode.match(/^[1-9][0-9]{5}$/)
          );
          // If no valid addresses, remove the field entirely
          if (processedGuardianData.addresses.length === 0) {
            delete processedGuardianData.addresses;
          }
        }

        console.log('Student Service - createStudent: Creating guardian with processed data:', JSON.stringify(processedGuardianData, null, 2));
        try {
          const createdGuardian = await strapi.entityService.create('api::guardian.guardian', {
            data: {
              ...processedGuardianData,
              student: student.id
            }
          });
          console.log('Student Service - createStudent: Successfully created guardian:', createdGuardian.id);
        } catch (guardianError) {
          console.error('Student Service - createStudent: Error creating guardian:', guardianError.message);
          if (guardianError.details && guardianError.details.errors) {
            console.error('Validation errors:', JSON.stringify(guardianError.details.errors, null, 2));
          }
          throw guardianError;
        }
      }
    }

    // 4. Create/Update administration + seat allocation if provided in input
    try {
      if (createdEnrollment) {
        await this.upsertAdministrationAndSeat(createdEnrollment.id, enrollmentsData[0]);
      }
    } catch (e) {
      console.error('Student Service - createStudent: admin/seat upsert failed:', e.message);
      // Do not fail the whole creation; admin/seat can be managed later
    }

    // Handle student photo upload if it exists
    

    return await this.findOneWithRelations(student.id);
  },

  async updateStudent(studentId, data) {
    console.log('🔍 updateStudent called with studentId:', studentId);
    console.log('📦 Full data received:', JSON.stringify(data, null, 2));

    // Separate student data from guardian data
    const studentData = { ...data
    };
    const guardiansData = studentData.guardians ? [...studentData.guardians] : [];
    delete studentData.guardians;

    const enrollmentsData = studentData.enrollments ? [...studentData.enrollments] : [];
    delete studentData.enrollments;

    console.log('📝 Enrollments data extracted:', JSON.stringify(enrollmentsData, null, 2));

    // 1. Update student
    const updatedStudent = await strapi.entityService.update('api::student.student', studentId, {
      data: studentData,
    });

    // 2. Update or create guardians
    for (const guardianData of guardiansData) {
      // Filter out empty contact numbers and addresses to avoid validation errors
      const processedGuardianData = { ...guardianData };

      // Filter contact_numbers - only keep those with valid numbers
      if (processedGuardianData.contact_numbers) {
        processedGuardianData.contact_numbers = processedGuardianData.contact_numbers.filter(
          contact => contact.number && contact.number.match(/^[+]?[0-9]{10,15}$/)
        );
        // If no valid contact numbers, remove the field entirely
        if (processedGuardianData.contact_numbers.length === 0) {
          delete processedGuardianData.contact_numbers;
        }
      }

      // Filter addresses - only keep those with all required fields
      if (processedGuardianData.addresses) {
        processedGuardianData.addresses = processedGuardianData.addresses.filter(
          addr => addr.address_line1 && addr.city && addr.state &&
                 addr.pincode && addr.pincode.match(/^[1-9][0-9]{5}$/)
        );
        // If no valid addresses, remove the field entirely
        if (processedGuardianData.addresses.length === 0) {
          delete processedGuardianData.addresses;
        }
      }

      if (processedGuardianData.id) {
        // Update existing guardian
        await strapi.entityService.update('api::guardian.guardian', processedGuardianData.id, {
          data: {
            ...processedGuardianData,
            student: studentId
          },
        });
      } else {
        // Create new guardian
        await strapi.entityService.create('api::guardian.guardian', {
          data: {
            ...processedGuardianData,
            student: studentId
          },
        });
      }
    }

    // 3. Update or create enrollments
    let targetEnrollmentId = null;
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
          targetEnrollmentId = existingEnrollments[0].id;
          await strapi.entityService.update('api::enrollment.enrollment', targetEnrollmentId, {
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
          const created = await strapi.entityService.create('api::enrollment.enrollment', {
            data: {
              ...enrollmentInput,
              student: studentId, // Link to the student
              academic_year: academicYearId,
              class: classId,
              gr_no: grNo,
              date_enrolled: new Date(enrollmentInput.date_enrolled).toISOString().split('T')[0],
            }
          });
          targetEnrollmentId = created.id;
          console.log('Student Service - updateWithGuardians: Successfully created new enrollment during update');
        }
      } catch (error) {
        console.error('Student Service - updateWithGuardians: Error processing enrollment', error.message);
        throw error;
      }
    }

    // 4. Create/Update administration + seat allocation if provided in input
    try {
      if (targetEnrollmentId) {
        console.log('🎯 Calling upsertAdministrationAndSeat with enrollmentId:', targetEnrollmentId);
        console.log('📋 Enrollment data for admin upsert:', JSON.stringify(enrollmentsData[0], null, 2));
        await this.upsertAdministrationAndSeat(targetEnrollmentId, enrollmentsData[0]);
      } else {
        console.log('⚠️ No targetEnrollmentId, skipping admin/seat upsert');
      }
    } catch (e) {
      console.error('Student Service - updateStudent: admin/seat upsert failed:', e.message);
      // Non-fatal
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

  // Helper: create or update administration + seat allocation from enrollment input
  async upsertAdministrationAndSeat(enrollmentId, enrollmentInput = {}) {
    console.log('🔧 upsertAdministrationAndSeat called with:', {
      enrollmentId,
      hasEnrollmentInput: !!enrollmentInput,
      hasAdministration: !!(enrollmentInput && enrollmentInput.administration),
      enrollmentInput: JSON.stringify(enrollmentInput, null, 2)
    });

    if (!enrollmentInput || !enrollmentInput.administration) {
      console.log('⚠️ No administration data found in enrollment input, returning early');
      return;
    }
    const adminInput = enrollmentInput.administration;
    console.log('📌 Administration input:', JSON.stringify(adminInput, null, 2));

    const parseId = (val) => {
      if (!val) return null;
      if (typeof val === 'object') return val.id || null;
      const n = parseInt(val, 10);
      return isNaN(n) ? null : n;
    };

    const divisionId = parseId(adminInput.division);
    const dateOfAdmission = (enrollmentInput.date_enrolled || new Date().toISOString().split('T')[0]).slice(0, 10);

    // Find existing administration for this enrollment
    const existingAdmins = await strapi.entityService.findMany('api::enrollment-administration.enrollment-administration', {
      filters: { enrollment: enrollmentId },
    });

    let adminId;
    if (existingAdmins && existingAdmins.length > 0) {
      adminId = existingAdmins[0].id;
      await strapi.entityService.update('api::enrollment-administration.enrollment-administration', adminId, {
        data: {
          division: divisionId || undefined,
          date_of_admission: dateOfAdmission,
          enrollment: enrollmentId,
        }
      });
    } else {
      const createdAdmin = await strapi.entityService.create('api::enrollment-administration.enrollment-administration', {
        data: {
          division: divisionId || undefined,
          date_of_admission: dateOfAdmission,
          enrollment: enrollmentId,
        }
      });
      adminId = createdAdmin.id;
    }

    // Handle seat allocation if pickup stop present
    const seatAllocInput = Array.isArray(adminInput.seat_allocations) && adminInput.seat_allocations.length > 0
      ? adminInput.seat_allocations[0]
      : null;
    if (!seatAllocInput) return;

    const pickupStopId = parseId(seatAllocInput.pickup_stop);
    if (!pickupStopId) return;

    // Try to derive a bus serving this stop via any route
    let busId = null;
    try {
      const routes = await strapi.entityService.findMany('api::bus-route.bus-route', {
        filters: { bus_stops: { id: pickupStopId } },
        populate: { bus: true },
      });
      if (routes && routes.length > 0 && routes[0].bus) {
        busId = routes[0].bus.id;
      }
    } catch (e) {
      // ignore; seat allocation can be created without bus
    }

    // Determine seat number if bus is known
    let seatNumber = 1;
    if (busId) {
      try {
        const bus = await strapi.entityService.findOne('api::bus.bus', busId, {
          populate: {
            seat_allocations: {
              filters: { is_active: true },
            }
          }
        });
        const allocated = (bus.seat_allocations || []).map(a => a.seat_number);
        for (let i = 1; i <= (bus.total_seats || 60); i++) {
          if (!allocated.includes(i)) { seatNumber = i; break; }
        }
      } catch (e) {
        // fallback seat number 1
      }
    }

    // Upsert active seat allocation for this admin
    const existingActive = await strapi.entityService.findMany('api::seat-allocation.seat-allocation', {
      filters: { enrollment_administration: adminId, is_active: true },
    });

    const allocData = {
      enrollment_administration: adminId,
      pickup_stop: pickupStopId,
      bus: busId || undefined,
      seat_number: seatNumber,
      allocation_date: new Date().toISOString().slice(0,10),
      valid_from: new Date().toISOString().slice(0,10),
      is_active: true,
      allocation_type: 'regular',
    };

    if (existingActive && existingActive.length > 0) {
      await strapi.entityService.update('api::seat-allocation.seat-allocation', existingActive[0].id, {
        data: allocData,
      });
    } else {
      await strapi.entityService.create('api::seat-allocation.seat-allocation', {
        data: allocData,
      });
    }
  },
}));
