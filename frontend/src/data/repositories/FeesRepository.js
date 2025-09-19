import { apiClient } from '../api/config';

export class FeesRepository {
  static async applicable({ studentId, periodStart, periodEnd }) {
    const params = { student: studentId };
    if (periodStart) params.periodStart = periodStart;
    if (periodEnd) params.periodEnd = periodEnd;
    const response = await apiClient.get('/fees/applicable', { params });
    return response.data; // already flattened in backend
  }
}

