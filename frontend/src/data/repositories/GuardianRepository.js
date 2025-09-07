import { apiClient } from '../api/config';

// Helper function to transform Strapi API response structure
const transformGuardianResponse = (guardianData) => {
  if (!guardianData) return null;

  // If it's a list of guardians
  if (Array.isArray(guardianData)) {
    return guardianData.map(item => transformGuardianResponse(item));
  }

  // If it's a single guardian object with an 'attributes' key
  if (guardianData.attributes) {
    const transformed = {
      id: guardianData.id,
      ...guardianData.attributes,
    };

    // Recursively transform nested relations
    for (const key in transformed) {
      if (transformed[key] && typeof transformed[key] === 'object' && transformed[key].data) {
        // Handle one-to-many or many-to-many relations
        if (Array.isArray(transformed[key].data)) {
          transformed[key] = transformed[key].data.map(item => ({ id: item.id, ...item.attributes }));
        } else if (transformed[key].data.attributes) {
          // Handle one-to-one or many-to-one relations
          transformed[key] = { id: transformed[key].data.id, ...transformed[key].data.attributes };
        } else {
            transformed[key] = null; // No attributes, set to null
        }
      }
    }
    return transformed;
  }

  // If it's already a flattened object or a simple value
  return guardianData;
};

export class GuardianRepository {
  static async findAll(params = {}) {
    const populateParams = {
      populate: {
        student: true,
      }
    };
    const response = await apiClient.get('/guardians', {
      params: { ...params, ...populateParams }
    });
    return transformGuardianResponse(response.data.data);
  }

  static async findById(id) {
    const populateParams = {
      populate: {
        student: true,
      }
    };
    const response = await apiClient.get(`/guardians/${id}`, { params: populateParams });
    return transformGuardianResponse(response.data.data);
  }

  static async create(guardianData) {
    const response = await apiClient.post('/guardians', { data: guardianData });
    return transformGuardianResponse(response.data.data);
  }

  static async update(id, guardianData) {
    const response = await apiClient.put(`/guardians/${id}`, { data: guardianData });
    return transformGuardianResponse(response.data.data);
  }

  static async delete(id) {
    const response = await apiClient.delete(`/guardians/${id}`);
    return response.data;
  }

  static async search(query) {
    const response = await apiClient.get('/guardians', {
      params: {
        filters: {
          $or: [
            { full_name: { $containsi: query } },
            { mobile: { $containsi: query } },
            { whatsapp_number: { $containsi: query } }
          ]
        }
      }
    });
    return transformGuardianResponse(response.data.data);
  }
}
