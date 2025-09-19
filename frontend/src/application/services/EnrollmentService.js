import { EnrollmentRepository } from '../../data/repositories/EnrollmentRepository';

export class EnrollmentService {
  constructor() {
    this.repository = EnrollmentRepository;
  }

  async getAllEnrollments() {
    try {
      const enrollments = await this.repository.getAllEnrollments();
      return {
        success: true,
        data: enrollments
      };
    } catch (error) {
      console.error('Error in EnrollmentService.getAllEnrollments:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch enrollments'
      };
    }
  }

  async getEnrollmentById(id) {
    try {
      const enrollment = await this.repository.getEnrollmentById(id);
      return {
        success: true,
        data: enrollment
      };
    } catch (error) {
      console.error('Error in EnrollmentService.getEnrollmentById:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch enrollment'
      };
    }
  }

  async createEnrollment(enrollmentData) {
    try {
      const enrollment = await this.repository.createEnrollment(enrollmentData);
      return {
        success: true,
        data: enrollment
      };
    } catch (error) {
      console.error('Error in EnrollmentService.createEnrollment:', error);
      return {
        success: false,
        error: error.message || 'Failed to create enrollment',
        details: error.response?.data
      };
    }
  }

  async updateEnrollment(id, enrollmentData) {
    try {
      const enrollment = await this.repository.updateEnrollment(id, enrollmentData);
      return {
        success: true,
        data: enrollment
      };
    } catch (error) {
      console.error('Error in EnrollmentService.updateEnrollment:', error);
      return {
        success: false,
        error: error.message || 'Failed to update enrollment',
        details: error.response?.data
      };
    }
  }

  async updateEnrollmentStatus(enrollmentId, enrollment_status) {
    try {
      const response = await this.repository.updateEnrollmentStatus(enrollmentId, enrollment_status);
      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error(`Error updating enrollment status for ID ${enrollmentId}:`, error.response?.data || error.message);
      return {
        success: false,
        error: error.message || 'Failed to update enrollment status'
      };
    }
  }

  async updateEnrollmentAdministration(enrollmentId, administrationData) {
    try {
      const response = await this.repository.updateEnrollmentAdministration(enrollmentId, administrationData);
      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error(`Error updating enrollment administration for ID ${enrollmentId}:`, error);
      return {
        success: false,
        error: error.message || 'Failed to update enrollment administration',
        details: error.response?.data
      };
    }
  }

  async deleteEnrollment(id) {
    try {
      await this.repository.deleteEnrollment(id);
      return {
        success: true
      };
    } catch (error) {
      console.error('Error in EnrollmentService.deleteEnrollment:', error);
      return {
        success: false,
        error: error.message || 'Failed to delete enrollment'
      };
    }
  }

  async getEnrollmentsByStudent(studentId) {
    try {
      const enrollments = await this.repository.getEnrollmentsByStudent(studentId);
      return {
        success: true,
        data: enrollments
      };
    } catch (error) {
      console.error(`Error fetching enrollments for student ${studentId}:`, error);
      return {
        success: false,
        error: error.message || 'Failed to fetch student enrollments'
      };
    }
  }

  async getEnrollmentsByClass(classId) {
    try {
      const enrollments = await this.repository.getEnrollmentsByClass(classId);
      return {
        success: true,
        data: enrollments
      };
    } catch (error) {
      console.error(`Error fetching enrollments for class ${classId}:`, error);
      return {
        success: false,
        error: error.message || 'Failed to fetch class enrollments'
      };
    }
  }

  async getEnrollmentsByDivision(divisionId) {
    try {
      const enrollments = await this.repository.getEnrollmentsByDivision(divisionId);
      return {
        success: true,
        data: enrollments
      };
    } catch (error) {
      console.error(`Error fetching enrollments for division ${divisionId}:`, error);
      return {
        success: false,
        error: error.message || 'Failed to fetch division enrollments'
      };
    }
  }
}
