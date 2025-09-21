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
    console.log('FeeAssignmentRepository findByClass response:', response.data);
    return response.data;
  }

  static async create(data) {
    console.log('FeeAssignmentRepository.create - Input data:', data);
    const response = await apiClient.post('/fee-assignments', { data });
    return response.data;
  }

  static async findAll(params = {}) {
    const defaultParams = {
      populate: {
        fee: { populate: { type: true, installments: true } },
        class: true,
        student: true,
        bus_route: true
      },
      sort: ['priority:asc','id:asc'],
      pagination: { pageSize: 100 } // Get more results
    };

    const response = await apiClient.get('/fee-assignments', { params: { ...defaultParams, ...params } });
    console.log('FeeAssignmentRepository findAll response:', response.data);
    return response.data;
  }

  static async delete(id) {
    const response = await apiClient.delete(`/fee-assignments/${id}`);
    return response.data;
  }

  static async findByBusStop(busStopId, params = {}) {
    const idNum = Number(busStopId);
    const filters = { bus_stop: { id: { $eq: isNaN(idNum) ? busStopId : idNum } } };
    const defaultParams = {
      filters,
      populate: { fee: { populate: { type: true, installments: true } }, bus_stop: true, student: true },
      sort: ['priority:asc','id:asc']
    };

    const response = await apiClient.get('/fee-assignments', { params: { ...defaultParams, ...params } });
    console.log('FeeAssignmentRepository findByBusStop response:', response.data);
    return response.data;
  }

  static async update(id, data) {
    const response = await apiClient.put(`/fee-assignments/${id}`, { data });
    return response.data;
  }

  static async findByStudent(studentId, params = {}) {
    const idNum = Number(studentId);
    const filters = { student: { id: { $eq: isNaN(idNum) ? studentId : idNum } } };
    const defaultParams = {
      filters,
      populate: { fee: { populate: { type: true, installments: true } }, class: true, student: true, bus_route: true },
      sort: ['priority:asc','id:asc']
    };

    const response = await apiClient.get('/fee-assignments', { params: { ...defaultParams, ...params } });
    console.log('FeeAssignmentRepository findByStudent response:', response.data);
    return response.data;
  }
}