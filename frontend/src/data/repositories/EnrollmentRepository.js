import { apiClient } from '../api/config';

export class EnrollmentRepository {
  static async findAll(params = {}) {
    const response = await apiClient.get('/enrollments', { params });
    return response.data;
  }

  static async create(enrollmentData) {
    const response = await apiClient.post('/enrollments', { data: enrollmentData });
    return response.data;
  }

  static async findByAcademicYear(yearId) {
    const response = await apiClient.get('/enrollments', {
      params: {
        filters: { academic_year: yearId }
      }
    });
    return response.data;
  }

  static async enrollStudent(studentId, enrollmentData) {
    const response = await apiClient.post('/enrollments/enroll', {
      data: {
        student_id: studentId,
        ...enrollmentData
      }
    });
    return response.data;
  }

  static async getStatistics(academicYearId) {
    const response = await apiClient.get(`/enrollments/statistics/${academicYearId}`);
    return response.data;
  }
}