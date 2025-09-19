import { apiClient } from '../api/config';

export class FeeAssignmentRepository {
  static async findByClass(classId, params = {}) {
    const idNum = Number(classId);
    const filters = { class: { id: { $eq: isNaN(idNum) ? classId : idNum } } };
    const defaultParams = {
      filters,
      populate: { fee: { populate: { type: true, installments: true } }, class: true, student: true, bus_route: true },
      sort: ['priority:asc','id:asc']
    };
    const response = await apiClient.get('/fee-assignments', { params: { ...defaultParams, ...params } });
    return response.data.data ?? response.data;
  }

  static async create(data) {
    const response = await apiClient.post('/fee-assignments', { data });
    return response.data.data ?? response.data;
  }

  static async delete(id) {
    const response = await apiClient.delete(`/fee-assignments/${id}`);
    return response.data;
  }
}

