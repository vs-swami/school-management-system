import { apiClient } from '../api/config';

export class ClassRepository {
  static async findAll() {
    const response = await apiClient.get('/classes?sort=classname:asc&populate=*');
    return response.data;
  }

  static async findById(id) {
    const response = await apiClient.get(`/classes/${id}?populate=*`);
    return response.data;
  }

  static async findAllWithSummary() {
    try {
      const response = await apiClient.get('/classes/summary');
      return response.data;
    } catch (error) {
      // Fallback to regular findAll if custom endpoint doesn't exist
      console.log('Summary endpoint not available, using regular findAll');
      return this.findAll();
    }
  }

  static async findWithStats(id) {
    try {
      const response = await apiClient.get(`/classes/${id}/stats`);
      return response.data;
    } catch (error) {
      // Fallback to regular findById if custom endpoint doesn't exist
      console.log('Stats endpoint not available, using regular findById');
      return this.findById(id);
    }
  }

  static async create(data) {
    const response = await apiClient.post('/classes', { data });
    return response.data;
  }

  static async update(id, data) {
    const response = await apiClient.put(`/classes/${id}`, { data });
    return response.data;
  }

  static async delete(id) {
    const response = await apiClient.delete(`/classes/${id}`);
    return response.data;
  }
}
