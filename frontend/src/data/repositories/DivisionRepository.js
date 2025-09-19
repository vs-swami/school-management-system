import { apiClient } from '../api/config';

export class DivisionRepository {
  static async findAll() {
    const response = await apiClient.get('/divisions');
    return response.data.data; // The transformResponseData interceptor will flatten this
  }

  /**
   * Find divisions available for a specific class
   * @param {number} classId - The class ID to find divisions for
   * @returns {Promise<Array>} - Array of divisions with capacity information
   */
  static async findByClass(classId) {
    if (!classId) return [];

    try {
      const response = await apiClient.get(`/divisions?filters[class_thresholds][class][id][$eq]=${classId}&populate=class_thresholds`);
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching divisions for class:', error);
      return [];
    }
  }

  /**
   * Find division with capacity information
   * @param {number} divisionId - The division ID
   * @returns {Promise<Object|null>} - Division with capacity data
   */
  static async findWithCapacity(divisionId) {
    if (!divisionId) return null;

    try {
      const response = await apiClient.get(`/divisions/${divisionId}?populate=class_thresholds,enrollments`);
      return response.data.data || null;
    } catch (error) {
      console.error('Error fetching division capacity:', error);
      return null;
    }
  }

  /**
   * Get comprehensive metrics for all divisions
   * Returns real data about student counts, demographics, etc.
   */
  static async getMetrics() {
    try {
      const response = await apiClient.get('/divisions/metrics');
      return response.data.data ?? response.data;
    } catch (error) {
      console.error('Error fetching division metrics:', error);
      return {};
    }
  }

  /**
   * Get metrics for a specific division
   */
  static async getDivisionMetrics(divisionId) {
    try {
      const response = await apiClient.get(`/divisions/metrics/${divisionId}`);
      return response.data.data ?? response.data;
    } catch (error) {
      console.error('Error fetching division metrics:', error);
      return null;
    }
  }

  /**
   * Get year group comparison (e.g., all Year 9 divisions)
   */
  static async getYearGroupComparison() {
    try {
      const response = await apiClient.get('/divisions/year-groups/comparison');
      return response.data.data ?? response.data;
    } catch (error) {
      console.error('Error fetching year group comparison:', error);
      return {};
    }
  }
}
