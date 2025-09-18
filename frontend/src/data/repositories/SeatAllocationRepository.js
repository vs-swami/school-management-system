import apiClient from '../api/apiClient';

export const SeatAllocationRepository = {
  /**
   * Get provisional seat allocation for a bus stop
   * @param {string} stopId - Bus stop ID
   * @returns {Promise<Object>} - Provisional seat allocation details
   */
  async getProvisionalAllocation(stopId) {
    try {
      const response = await apiClient.get(`/seat-allocations/provisional/${stopId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching provisional allocation:', error);
      throw error;
    }
  },

  /**
   * Get seat availability for all routes serving a stop
   * @param {string} stopId - Bus stop ID
   * @returns {Promise<Object>} - Seat availability data
   */
  async getSeatAvailability(stopId) {
    try {
      const response = await apiClient.get(`/seat-allocations/availability/${stopId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching seat availability:', error);
      throw error;
    }
  },

  /**
   * Preview seat allocation before actual assignment
   * @param {Object} allocationData - Allocation preview data
   * @returns {Promise<Object>} - Preview results
   */
  async previewAllocation(allocationData) {
    try {
      const response = await apiClient.post('/seat-allocations/preview', allocationData);
      return response.data;
    } catch (error) {
      console.error('Error previewing allocation:', error);
      throw error;
    }
  }
};