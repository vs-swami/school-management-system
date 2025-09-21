import { apiClient } from '../api/config';

// Strapi 5: Return raw API data - all transformations handled by mappers
export const GuardianRepository = {
  // Get all guardians
  async findAll(params = {}) {
    try {
      const response = await apiClient.get('/guardians', { params });
      return response.data.data || response.data || [];
    } catch (error) {
      console.error('Error fetching guardians:', error);
      throw error;
    }
  },

  // Get a single guardian by ID
  async findById(id) {
    try {
      const response = await apiClient.get(`/guardians/${id}`, {
        params: {
          populate: '*'
        }
      });
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error fetching guardian by ID:', error);
      throw error;
    }
  },

  // Create a new guardian
  async create(guardianData) {
    try {
      // Check if data has a wrapper
      const data = guardianData.data || guardianData;

      const response = await apiClient.post('/guardians', { data });
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error creating guardian:', error);
      throw error;
    }
  },

  // Update a guardian
  async update(id, guardianData) {
    try {
      // Check if data has a wrapper
      const data = guardianData.data || guardianData;

      const response = await apiClient.put(`/guardians/${id}`, { data });
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error updating guardian:', error);
      throw error;
    }
  },

  // Delete a guardian
  async delete(id) {
    try {
      const response = await apiClient.delete(`/guardians/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting guardian:', error);
      throw error;
    }
  },

  // Get guardians for a student
  async findByStudent(studentId) {
    try {
      const response = await apiClient.get('/guardians', {
        params: {
          filters: {
            student: {
              id: { $eq: studentId }
            }
          },
          populate: '*'
        }
      });
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching guardians for student:', error);
      throw error;
    }
  }
};