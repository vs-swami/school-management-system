import { apiClient } from '../api/config';

export class FeeDefinitionRepository {
  static async findAll(params = {}) {
    const defaultParams = {
      populate: { type: true, installments: true },
      sort: ['name:asc']
    };
    const response = await apiClient.get('/fee-definitions', { params: { ...defaultParams, ...params } });
    return response.data.data ?? response.data;
  }

  static async findById(id, params = {}) {
    const defaultParams = { populate: { type: true, installments: true } };
    const response = await apiClient.get(`/fee-definitions/${id}`, { params: { ...defaultParams, ...params } });
    return response.data.data ?? response.data;
  }

  static async create(data) {
    const response = await apiClient.post('/fee-definitions', { data });
    return response.data.data ?? response.data;
  }

  static async update(id, data) {
    const response = await apiClient.put(`/fee-definitions/${id}`, { data });
    return response.data.data ?? response.data;
  }

  static async delete(id) {
    const response = await apiClient.delete(`/fee-definitions/${id}`);
    return response.data;
  }
}

