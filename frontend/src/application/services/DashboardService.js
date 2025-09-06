import {DashboardRepository} from "../../data/repositories/DashboardRepository";

export class DashboardService {
  async getMetrics() {
    try {
      const metrics = await DashboardRepository.fetchMetrics();
      return { success: true, data: metrics };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

}

export default new DashboardService();