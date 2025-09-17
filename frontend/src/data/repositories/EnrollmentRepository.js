import { apiClient } from '../api/config';

// Helper function to transform Strapi API response structure for enrollments (Strapi 5 flattened)
const transformEnrollmentResponse = (enrollmentData) => {
  console.log('transformEnrollmentResponse: received data', enrollmentData);
  if (!enrollmentData) {
    console.log('transformEnrollmentResponse: data is null or undefined');
    return null;
  }

  if (Array.isArray(enrollmentData)) {
    console.log('transformEnrollmentResponse: data is an array', enrollmentData);
    return enrollmentData.map(item => transformEnrollmentResponse(item));
  }

  // For a single enrollment object, extract id and attributes
  const transformed = {
    id: enrollmentData.id,
    ...enrollmentData.attributes,
  };

  // No more recursive flattening for .data.attributes as backend should handle it
  console.log('transformEnrollmentResponse: transformed item', transformed);
  return transformed;
};

export const EnrollmentRepository = {
  getAllEnrollments: async () => {
    const populateParams = {
      populate: 'student,academic_year,administration.division,class',
    };
    const response = await apiClient.get('/enrollments', { params: populateParams });
    return transformEnrollmentResponse(response.data.data);
  },

  updateEnrollment: async (id, data) => {
    const response = await apiClient.put(`/enrollments/${id}/enrollment_status`, { data });
    return response.data;
  },

  getEnrollmentById: async (id) => {
    const populateParams = {
      populate: 'student,academic_year,administration.division,class',
    };
    const response = await apiClient.get(`/enrollments/${id}`, { params: populateParams });
    return transformEnrollmentResponse(response.data.data);
  },

  createEnrollment: async (data) => {
    const { division, date_of_admission, mode, admission_type, ...enrollmentData } = data;
    const response = await apiClient.post('/enrollments', {
      data: enrollmentData,
      administration: {
        division,
        date_of_admission,
        mode,
        admission_type,
      },
    });
    return transformEnrollmentResponse(response.data);
  },

  deleteEnrollment: async (id) => {
    const response = await apiClient.delete(`/enrollments/${id}`);
    return response.data; // Deletion usually doesn't require transformation
  },

  updateEnrollmentAdministration: async (enrollmentId, administrationData) => {
    const response = await apiClient.put(`/enrollment-administrations/${enrollmentId}`, { data: administrationData });
    return transformEnrollmentResponse(response.data);
  },
};