import { apiClient } from '../api/config';

export class StudentRepository {
  static async findAll(params = {}) {
    const response = await apiClient.get('/students', { params });
    return response.data;
  }

  static async findById(id) {
    const response = await apiClient.get(`/students/${id}`);
    return response.data;
  }

  static async create(studentData) {
    const response = await apiClient.post('/students', { data: studentData });
    console.log('API response from create:', response);
    return response.data;
  }

  static async update(id, studentData) {
    const response = await apiClient.put(`/students/${id}`, { data: studentData });
    return response.data;
  }

  static async delete(id) {
    const response = await apiClient.delete(`/students/${id}`);
    return response.data;
  }

  static async getStatistics() {
    const response = await apiClient.get('/students/statistics');
    return response.data;
  }

  static async search(query) {
    const response = await apiClient.get('/students', {
      params: {
        filters: {
          $or: [
            { gr_full_name: { $containsi: query } },
            { first_name: { $containsi: query } },
            { last_name: { $containsi: query } }
          ]
        }
      }
    });
    return response.data;
  }
}