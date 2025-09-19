import { apiClient } from '../api/config';

export class FeeTypeRepository {
  static async findAll(params = {}) {
    const response = await apiClient.get('/fee-types', { params });
    return response.data.data ?? response.data; // transformer may wrap differently
  }

  static async create(data) {
    const response = await apiClient.post('/fee-types', { data });
    return response.data.data ?? response.data;
  }

  static async update(id, data) {
    const response = await apiClient.put(`/fee-types/${id}`, { data });
    return response.data.data ?? response.data;
  }

  static async delete(id) {
    const response = await apiClient.delete(`/fee-types/${id}`);
    return response.data;
  }
}

