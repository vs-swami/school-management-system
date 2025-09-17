import { apiClient } from '../api/config';

const transformClassThresholdResponse = (data) => {
  if (!data) return null;

  if (Array.isArray(data)) {
    return data.map(item => transformClassThresholdResponse(item));
  }

  const transformed = {
    id: data.id,
    ...data.attributes,
  };

  // Handle nested relations
  if (transformed.class && transformed.class.data) {
    transformed.class = {
      id: transformed.class.data.id,
      ...transformed.class.data.attributes,
    };
  }
  if (transformed.division && transformed.division.data) {
    transformed.division = {
      id: transformed.division.data.id,
      ...transformed.division.data.attributes,
    };
  }

  return transformed;
};

export class ClassThresholdRepository {
  static async getAvailableCapacity(classId, divisionId = null) {
    try {
      console.log('Fetching available capacity for classId:', classId, 'divisionId:', divisionId);
      let url = `/class-thresholds/utilization/${classId}`;
      //if (divisionId) {
      //  url += `&divisionId=${divisionId}`;
      //}
      const response = await apiClient.get(url);
      // The backend service returns a direct object, no need for transform here
      console.log('Received response:', response.data);
      return response.data; 
    } catch (error) {
      console.error('Error fetching available capacity:', error.response?.data || error.message);
      throw error;
    }
  }

  // Add other CRUD or custom methods here if needed in the future
}
