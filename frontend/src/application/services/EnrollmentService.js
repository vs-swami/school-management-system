import { EnrollmentRepositoryAdapter } from '../../data/adapters/EnrollmentRepositoryAdapter';

export class EnrollmentService {
  constructor() {
    this.repository = new EnrollmentRepositoryAdapter();
  }

  async getAllEnrollments() {
    try {
      const enrollments = await this.repository.findAll();
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
      const enrollment = await this.repository.findById(id);
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
      const enrollment = await this.repository.create(enrollmentData);
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
      const enrollment = await this.repository.update(id, enrollmentData);
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
      const enrollment = await this.repository.findById(enrollmentId);
      enrollment.status = enrollment_status;
      const response = await this.repository.update(enrollmentId, enrollment);
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
      const enrollment = await this.repository.findById(enrollmentId);
      enrollment.administration = administrationData;
      const response = await this.repository.update(enrollmentId, enrollment);
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
      await this.repository.delete(id);
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
      const enrollments = await this.repository.findByStudent(studentId);
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

  async getEnrollmentsByClass(classId, divisionId = null) {
    try {
      const enrollments = await this.repository.findByClass(classId, divisionId);
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
      const enrollments = await this.repository.findByDivision(divisionId);
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
