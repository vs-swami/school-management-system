import { apiClient } from '../api/config';

// Helper function to transform Strapi API response structure for enrollments
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

  if (enrollmentData.attributes) {
    console.log('transformEnrollmentResponse: data has attributes', enrollmentData.attributes);
    const transformed = {
      id: enrollmentData.id,
      ...enrollmentData.attributes,
    };

    for (const key in transformed) {
      if (transformed[key] && typeof transformed[key] === 'object' && transformed[key].data) {
        if (Array.isArray(transformed[key].data)) {
          transformed[key] = transformed[key].data.map(item => ({ id: item.id, ...item.attributes }));
        } else if (transformed[key].data.attributes) {
          transformed[key] = { id: transformed[key].data.id, ...transformed[key].data.attributes };
        } else {
            transformed[key] = null; // No attributes, set to null
        }
      }
    }
    console.log('transformEnrollmentResponse: transformed item', transformed);
    return transformed;
  }

  console.log('transformEnrollmentResponse: returning original data', enrollmentData);
  return enrollmentData;
};

export const EnrollmentRepository = {
  getAllEnrollments: async () => {
    const response = await apiClient.get('/enrollments', { params: { populate: '*', } });
    return transformEnrollmentResponse(response.data);
  },

  updateEnrollment: async (id, data) => {
    const response = await apiClient.put(`/enrollments/${id}/status`, { data });
    return transformEnrollmentResponse(response.data);
  },

  getEnrollmentById: async (id) => {
    const response = await apiClient.get(`/enrollments/${id}`, { params: { populate: '*', } });
    return transformEnrollmentResponse(response.data);
  },

  createEnrollment: async (data) => {
    const response = await apiClient.post('/enrollments', { data });
    return transformEnrollmentResponse(response.data);
  },

  deleteEnrollment: async (id) => {
    const response = await apiClient.delete(`/enrollments/${id}`);
    return response.data; // Deletion usually doesn't require transformation
  },
};