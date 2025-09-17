import { apiClient } from '../../data/api/config';

export class EnrollmentService {
  async updateEnrollmentStatus(enrollmentId, enrollment_status) {
    try {
      const response = await EnrollmentRepository.updateEnrollment(enrollmentId, { enrollment_status });
      return { success: true, data: response };
    } catch (error) {
      console.error(`Error updating enrollment status for ID ${enrollmentId}:`, error.response?.data || error.message);
      return { success: false, error: error.message };
    }
  }
}
