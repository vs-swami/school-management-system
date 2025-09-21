import { apiClient } from '../api/config';

export const EnrollmentRepository = {
  // Get all enrollments with populated relations
  getAllEnrollments: async () => {
    try {
      // For Strapi v5, use populate=* to get all relations
      const response = await apiClient.get('/enrollments?populate=*');

      console.log('Raw enrollment API response:', response);

      // Return the data array - Strapi 5 has flatter structure
      // Ensure we always return an array
      const enrollments = response.data;
      return Array.isArray(enrollments) ? enrollments : [];
    } catch (error) {
      console.error('Error fetching enrollments:', {
        status: error.response?.status,
        error: error.response?.data?.error,
        message: error.message,
        fullResponse: error.response
      });
      throw error;
    }
  },

  // Get a single enrollment by ID
  getEnrollmentById: async (id) => {
    const response = await apiClient.get(`/enrollments/${id}?populate=*`);
    return response.data;
  },

  // Create a new enrollment
  createEnrollment: async (enrollmentData) => {
    const response = await apiClient.post('/enrollments', { data: enrollmentData });
    return response.data;
  },

  // Update an enrollment
  updateEnrollment: async (id, data) => {
    const response = await apiClient.put(`/enrollments/${id}`, { data });
    return response.data;
  },

  // Delete an enrollment
  deleteEnrollment: async (id) => {
    const response = await apiClient.delete(`/enrollments/${id}`);
    return response.data;
  },

  // Custom method to update only enrollment status
  updateEnrollmentStatus: async (id, enrollment_status) => {
    const response = await apiClient.put(`/enrollments/${id}/enrollment_status`, {
      data: { enrollment_status }
    });
    return response.data;
  },

  // Update enrollment administration data
  updateEnrollmentAdministration: async (enrollmentId, administrationData) => {
    // This should update the administration relation of the enrollment
    const response = await apiClient.put(`/enrollments/${enrollmentId}`, {
      data: {
        administration: administrationData
      }
    });
    return response.data;
  },
};