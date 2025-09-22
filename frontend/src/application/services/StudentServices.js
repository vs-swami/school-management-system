import { StudentRepositoryAdapter } from '../../data/adapters/StudentRepositoryAdapter';
import { ValidationStrategy } from '../strategies/ValidationStrategy';
import { StudentDocumentRepository } from '../../data/repositories/StudentDocumentRepository'; // Import the new repository
//import { AuditService } from './AuditService';

export class StudentService {
  constructor() {
    this.repository = new StudentRepositoryAdapter();
    this.validationStrategy = new ValidationStrategy();
    //this.auditService = new AuditService();
  }

  async getAllStudents(filters = {}) {
    try {
      const students = await this.repository.findAll(filters);
      return {
        success: true,
        data: students,
      };
    } catch (error) {
      console.error('Error in StudentService.getAllStudents:', error);
      const errorMessage = error?.response?.data?.error?.message ||
                          error?.message ||
                          'An error occurred while processing your request';
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  async getStudentById(id) {
    try {
      const student = await this.repository.findById(id);
      return {
        success: true,
        data: student,
      };
    } catch (error) {
      console.error('Error in StudentService.getStudentById:', error);
      const errorMessage = error?.response?.data?.error?.message ||
                          error?.message ||
                          'An error occurred while processing your request';
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  async createStudent(data) { // Removed files parameter
    try {
      // Validate data (only the plain data, not files)
      const validation = this.validationStrategy.validateStudent(data);
      if (!validation.isValid) {
        console.log('Validation errors:', validation);
        return {
          success: false,
          error: 'Validation failed',
          details: validation.errors,
        };
      }

      // Keep enrollment data with student data - backend handles the creation
      // The backend createStudent method expects enrollments to be included
      // and will handle creating them separately after student creation
      const student = await this.repository.create(data);

      // Audit log
      //await this.auditService.log('STUDENT_CREATED', {
      //  studentId: student.id,
      //  studentName: student.gr_full_name,
      //});

      return {
        success: true,
        data: student,
      };
    } catch (error) {
      console.error('Error in StudentService.createStudent:', error);
      const errorMessage = error?.response?.data?.error?.message ||
                          error?.message ||
                          'An error occurred while processing your request';
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  async updateStudent(id, data) { // Removed files parameter
    try {
      const validation = this.validationStrategy.validateStudent(data); // Validate data only
      if (!validation.isValid) {
        console.log('Validation errors:', validation);
        return {
          success: false,
          error: 'Validation failed',
          details: validation.errors,
        };
      }
      console.log('Updating student with data:', data);
      const student = await this.repository.update(id, data); // Using adapter instead of repository directly
      
      //await this.auditService.log('STUDENT_UPDATED', {
      //  studentId: id,
      //  studentName: student.gr_full_name,
      //});

      return {
        success: true,
        data: student,
      };
    } catch (error) {
      console.error('Error in StudentService.updateStudent:', error);
      const errorMessage = error?.response?.data?.error?.message ||
                          error?.message ||
                          'An error occurred while processing your request';
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  async rejectStudent(studentId, enrollmentData) { // Modified to accept studentId and enrollmentData
    try {
      if (!enrollmentData || !enrollmentData.id) {
        throw new Error('Enrollment data or ID is missing for rejection.');
      }

      const enrollmentId = enrollmentData.id;
      const enrollment_status = enrollmentData.enrollment_status; // Assuming enrollment_status is 'Rejected'

      // Call the new EnrollmentService method
      const result = await this.enrollmentService.updateEnrollmentStatus(enrollmentId, enrollment_status);

      if (result.success) {
        // Optionally, refetch student to update local state if needed elsewhere
        // await this.getStudentById(studentId);
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Error in StudentService rejecting student:', error);
      return { success: false, error: error.message };
    }
  }


  async uploadStudentDocument(studentId, documentType, file, description = null) {
    try {
      const document = await StudentDocumentRepository.create(studentId, documentType, file, description);
      return { success: true, data: document };
    } catch (error) {
      console.error('Error uploading student document:', error);
      return { success: false, error: error.message };
    }
  }

  async updateStudentDocument(documentId, studentId, documentType, file, description = null) {
    try {
      const document = await StudentDocumentRepository.update(documentId, studentId, documentType, file, description);
      return { success: true, data: document };
    } catch (error) {
      console.error('Error updating student document:', error);
      return { success: false, error: error.message };
    }
  }

  async deleteStudentDocument(documentId) {
    try {
      const result = await StudentDocumentRepository.delete(documentId);
      return { success: true, data: result };
    } catch (error) {
      console.error('Error deleting student document:', error);
      return { success: false, error: error.message };
    }
  }

  async searchStudents(query) {
    try {
      const students = await this.repository.searchStudents(query);
      return {
        success: true,
        data: students,
      };
    } catch (error) {
      console.error('Error in StudentService.searchStudents:', error);
      const errorMessage = error?.response?.data?.error?.message ||
                          error?.message ||
                          'An error occurred while processing your request';
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  async getStatistics() {
    try {
      const stats = await this.repository.getStatistics();
      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      console.error('Error in StudentService.getStatistics:', error);
      const errorMessage = error?.response?.data?.error?.message ||
                          error?.message ||
                          'An error occurred while processing your request';
      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}