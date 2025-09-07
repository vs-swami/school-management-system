'use strict';

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::student.student', ({ strapi }) => ({
  // Repository Pattern Implementation
  async findWithRelations(params = {}) {
    const { filters, ...otherParams } = params;
    
    return await strapi.entityService.findMany('api::student.student', {
      ...otherParams,
      filters,
      populate: {
        place: true,
        caste: true,
        house: true,
        guardians: true,
        enrollments: {
          populate: {
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
  },

  async findOneWithRelations(id) {
    return await strapi.entityService.findOne('api::student.student', id, {
      populate: {
        place: true,
        caste: true,
        house: true,
        guardians: true,
        enrollments: {
          populate: {
            academic_year: true,
            administration: {
              populate: {
                division: true
              }
            }
          }
        },
        documents: true
      }
    });
  },

  async createStudentWithRelations(data, files) { // Added files argument
    console.log('Student Service - createStudentWithRelations: Received Data (after JSON.parse)', JSON.stringify(data, null, 2));
    const { guardians, enrollments, ...studentData } = data;
    console.log('Creating student with data:', studentData);
    // Create student first
    const student = await strapi.entityService.create('api::student.student', {
      data: studentData
    });

    // Create guardians
    if (guardians && guardians.length > 0) {
      for (const guardianData of guardians) {
        // Need to capture the created guardian's ID for linking its photo
        const createdGuardian = await strapi.entityService.create('api::guardian.guardian', {
          data: {
            ...guardianData,
            student: student.id
          }
        });
        // If a guardian photo exists, upload it and link it
        if (files && files.guardian_photo) { // Changed condition
          await this.handleFileUpload({
            files: files.guardian_photo,
            documentType: 'guardian_photo',
            studentId: student.id,
            guardianId: createdGuardian.id,
          });
        }
      }
    }

    // Create enrollments
    if (enrollments && enrollments.length > 0) {
      console.log('Student Service - createStudentWithRelations: Processing Enrollments', JSON.stringify(enrollments, null, 2));
      for (const enrollmentData of enrollments) {
        try {
          const { division, date_of_admission, mode, admission_type, gr_no: initialGrNo, ...baseEnrollmentData } = enrollmentData;

          const academicYear = await strapi.entityService.findOne('api::academic-year.academic-year', parseInt(academic_year));
          if (!academicYear) {
            throw new Error(`Academic year with ID ${academic_year} not found.`);
          }
          const grNo = await strapi.service('api::enrollment.enrollment').generateGRNumber(baseEnrollmentData.class_standard, academicYear.id);

          const createdEnrollment = await strapi.entityService.create('api::enrollment.enrollment', {
            data: {
              ...baseEnrollmentData,
              student: student.id,
              gr_no: grNo,
              academic_year: academicYear.id,
            }
          });

          await strapi.entityService.create('api::enrollment-administration.enrollment-administration', {
            data: {
              enrollment: createdEnrollment.id,
              division: division,
              date_of_admission: date_of_admission,
              mode: mode,
              admission_type: admission_type,
            }
          });

          console.log('Student Service - createStudentWithRelations: Successfully created enrollment', JSON.stringify(enrollmentData, null, 2));
        } catch (error) {
          console.error('Student Service - createStudentWithRelations: Error creating enrollment', JSON.stringify(enrollmentData, null, 2), error.message);
          throw error; // Re-throw to propagate the error
        }
      }
    }

    // Handle student photo upload if it exists
    if (files && files.student_photo) { // Changed condition
      try {
        await this.handleFileUpload({
          files: files.student_photo,
          documentType: 'student_photo',
          studentId: student.id,
        });
      } catch (error) {
        console.error('Student Service - createStudentWithRelations: Error uploading student photo', error.message);
        throw error;
      }
    }

    return await this.findOneWithRelations(student.id);
  },

  async updateWithGuardians(studentId, data, files) { // Added files argument
    const { guardians, enrollments, ...studentData } = data; // Also extract enrollments

    console.log('Student Service - updateWithGuardians: Student ID', studentId);
    console.log('Student Service - updateWithGuardians: Student Data (after guardian extraction)', JSON.stringify(studentData, null, 2));
    console.log('Student Service - updateWithGuardians: Guardian Data', JSON.stringify(guardians, null, 2));
    console.log('Student Service - updateWithGuardians: Enrollment Data', JSON.stringify(enrollments, null, 2));
    console.log('Student Service - updateWithGuardians: Files', files);
    
    // Update student
    const updatedStudent = await strapi.entityService.update('api::student.student', studentId, {
      data: studentData,
      populate: {
        guardians: true, // Populate guardians to get existing ones
        enrollments: true, // Populate enrollments for updates
        documents: true, // Populate documents to check for existing photos
      }
    });

    // Handle guardian updates
    if (guardians && guardians.length > 0) {
      for (const guardianData of guardians) {
        try {
          if (guardianData.id) {
            // Update existing guardian
            console.log('Student Service - updateWithGuardians: Updating guardian with ID', guardianData.id, 'Data:', JSON.stringify(guardianData, null, 2));
            const currentGuardian = await strapi.entityService.findOne('api::guardian.guardian', guardianData.id, {
              populate: { documents: true } // Populate documents to check for existing photo
            });
            await strapi.entityService.update('api::guardian.guardian', guardianData.id, {
              data: guardianData
            });

            // Handle guardian photo update
            if (files && files.guardian_photo) { // Changed condition
              await this.handleFileUpload({
                files: files.guardian_photo,
                documentType: 'guardian_photo',
                studentId: studentId,
                guardianId: guardianData.id,
                existingDocuments: currentGuardian.documents,
              });
            }
          } else {
            // Create new guardian and link to student
            console.log('Student Service - updateWithGuardians: Creating new guardian with Data:', JSON.stringify(guardianData, null, 2));
            const createdGuardian = await strapi.entityService.create('api::guardian.guardian', {
              data: {
                ...guardianData,
                student: studentId
              }
            });
            // If a guardian photo exists, upload it and link it
            if (files && files.guardian_photo) { // Changed condition
              await this.handleFileUpload({
                files: files.guardian_photo,
                documentType: 'guardian_photo',
                studentId: studentId,
                guardianId: createdGuardian.id,
              });
            }
          }
        } catch (error) {
          console.error('Student Service - updateWithGuardians: Error processing guardian', guardianData.id || 'new', error.message);
          throw error; // Re-throw to propagate the error
        }
      }
    }

    // Handle enrollment updates (similar to guardians, but enrollments can be added/updated/deleted)
    if (enrollments && enrollments.length > 0) {
      for (const enrollmentData of enrollments) {
        try {
          const { division, date_of_admission, mode, admission_type, ...baseEnrollmentData } = enrollmentData;

          if (enrollmentData.id) {
            // Update existing enrollment
            console.log('Student Service - updateWithGuardians: Updating enrollment with ID', enrollmentData.id, 'Data:', JSON.stringify(enrollmentData, null, 2));
            const updatedEnrollment = await strapi.entityService.update('api::enrollment.enrollment', enrollmentData.id, {
              data: { ...baseEnrollmentData, student: studentId } // Ensure student relation is maintained
            });

            // Update or create enrollment administration entry
            const existingAdmin = await strapi.entityService.findMany('api::enrollment-administration.enrollment-administration', {
              filters: { enrollment: updatedEnrollment.id }
            });

            if (existingAdmin.length > 0) {
              await strapi.entityService.update('api::enrollment-administration.enrollment-administration', existingAdmin[0].id, {
                data: {
                  division: division,
                  date_of_admission: date_of_admission,
                  mode: mode,
                  admission_type: admission_type,
                }
              });
            } else {
              await strapi.entityService.create('api::enrollment-administration.enrollment-administration', {
                data: {
                  enrollment: updatedEnrollment.id,
                  division: division,
                  date_of_admission: date_of_admission,
                  mode: mode,
                  admission_type: admission_type,
                }
              });
            }

          } else {
            // Create new enrollment
            console.log('Student Service - updateWithGuardians: Creating new enrollment with Data:', JSON.stringify(enrollmentData, null, 2));
            const createdEnrollment = await strapi.entityService.create('api::enrollment.enrollment', {
              data: { ...baseEnrollmentData, student: studentId }
            });

            // Create new enrollment administration entry
            await strapi.entityService.create('api::enrollment-administration.enrollment-administration', {
              data: {
                enrollment: createdEnrollment.id,
                division: division,
                date_of_admission: date_of_admission,
                mode: mode,
                admission_type: admission_type,
              }
            });
          }
        } catch (error) {
          console.error('Student Service - updateWithGuardians: Error processing enrollment', enrollmentData.id || 'new', error.message);
          throw error;
        }
      }
    }

    // Handle student photo upload/update
    if (files && files.student_photo) { // Changed condition
      try {
        await this.handleFileUpload({
          files: files.student_photo,
          documentType: 'student_photo',
          studentId: studentId,
          existingDocuments: updatedStudent.documents,
        });
      } catch (error) {
        console.error('Student Service - updateWithGuardians: Error uploading student photo', error.message);
        throw error;
      }
    }

    return await this.findOneWithRelations(studentId);
  },

  // Helper function to handle file uploads and document creation/update
  async handleFileUpload({ files, documentType, studentId, guardianId = null, existingDocuments = [] }) {
    console.log('handleFileUpload: Received files for upload:', files);
    let uploadedFile;
    try {
      uploadedFile = await strapi.plugins.upload.services.upload.upload({
        data: {}, // Additional data if needed
        files: files,
      });
      console.log('handleFileUpload: Result from Strapi upload service:', uploadedFile);
    } catch (uploadError) {
      console.error('handleFileUpload: Error during Strapi file upload:', uploadError.message, uploadError);
      throw new Error(`File upload failed for ${documentType}: ${uploadError.message}`);
    }

    if (uploadedFile && uploadedFile.length > 0) {
      const fileId = uploadedFile[0].id;

      // Check if an existing document of this type exists for the student/guardian
      const existingDoc = existingDocuments.find(doc => 
        doc.document_type === documentType && 
        doc.student?.id === studentId && 
        (guardianId ? doc.guardian?.id === guardianId : !doc.guardian)
      );

      try {
      if (existingDoc) {
        // Update existing document entry with new file
        console.log('handleFileUpload: Updating existing student-document entry', existingDoc.id, 'with file ID:', fileId);
        await strapi.entityService.update('api::student-document.student-document', existingDoc.id, {
          data: {
            file: fileId,
          }
        });
        // Optionally, delete the old file from Strapi uploads if no longer referenced
        // await strapi.plugins.upload.services.upload.remove(existingDoc.file.id);
      } else {
        // Create new document entry
        const newDocumentData = {
          document_type: documentType,
          file: fileId,
          student: studentId,
          ...(guardianId && { guardian: guardianId }),
        };
        console.log('handleFileUpload: Creating new student-document entry with data:', newDocumentData);
        await strapi.entityService.create('api::student-document.student-document', {
          data: newDocumentData
        });
      }
      } catch (documentError) {
        console.error('handleFileUpload: Error creating/updating student-document entry:', documentError.message, documentError);
        // Optionally, delete the uploaded file from Strapi media library if document creation failed
        // await strapi.plugins.upload.services.upload.remove(fileId);
        throw new Error(`Student document entry failed for ${documentType}: ${documentError.message}`);
      }
    }
  },

  async getStatistics() {
    const totalStudents = await strapi.entityService.count('api::student.student');
    
    const genderStats = await strapi.db.connection.raw(`
      SELECT gender, COUNT(*) as count 
      FROM students 
      GROUP BY gender
    `);

    const houseStats = await strapi.db.connection.raw(`
      SELECT h.name, COUNT(s.id) as count
      FROM houses h
      LEFT JOIN students s ON h.id = s.house
      GROUP BY h.id, h.name
    `);

    return {
      total: totalStudents,
      byGender: genderStats.rows || [],
      byHouse: houseStats.rows || []
    };
  }
}));