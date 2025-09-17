import { apiClient } from '../api/config';

// Helper function to transform Strapi API response structure for classes
const transformClassResponse = (classData) => {
  if (!classData) return null;

  if (Array.isArray(classData)) {
    return classData.map(item => transformClassResponse(item));
  }

  if (classData.attributes) {
    const transformed = {
      id: classData.id,
      ...classData.attributes,
    };
    // No nested relations to transform for Class based on its simple schema
    return transformed;
  }

  return classData;
};

export class ClassRepository {
  static async findAll() {
    const response = await apiClient.get('/classes?sort=classname:asc');
    return transformClassResponse(response.data.data);
  }

  static async findById(id) {
    const response = await apiClient.get(`/classes/${id}`);
    return transformClassResponse(response.data.data);
  }

  static async create(data) {
    const response = await apiClient.post('/classes', { data });
    return transformClassResponse(response.data.data);
  }

  static async update(id, data) {
    const response = await apiClient.put(`/classes/${id}`, { data });
    return transformClassResponse(response.data.data);
  }

  static async delete(id) {
    const response = await apiClient.delete(`/classes/${id}`);
    return response.data;
  }
}
