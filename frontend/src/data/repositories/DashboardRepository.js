import { apiClient } from '../api/config';
export class DashboardRepository {

  static async getMetrics() {
      const response = await apiClient.get(`/dashboard/metrics`)
      return response.data;
  }
}
