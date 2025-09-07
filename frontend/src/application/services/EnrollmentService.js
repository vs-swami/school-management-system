import { EnrollmentRepository } from '../../data/repositories/EnrollmentRepository';

export const EnrollmentService = {
  getEnrollments: async () => {
    try {
      const response = await EnrollmentRepository.getAllEnrollments();
      return response.data;
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      throw error;
    }
  },

  updateEnrollmentStatus: async (id, status) => {
    try {
      const response = await EnrollmentRepository.updateEnrollment(id, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating enrollment status:', error);
      throw error;
    }
  },
};
