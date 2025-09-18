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
}
