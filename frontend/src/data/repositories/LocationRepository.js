import { apiClient } from '../api/config';

export class LocationRepository {
  static async findAll(params = {}) {
    try {
      const defaultParams = {
        params: {
          populate: '*',
          filters: { is_active: true },
          sort: ['name:asc']
        }
      };
      const response = await apiClient.get('/locations', { ...defaultParams, ...params });
      // Strapi 5: Handle response structure { data: [...], meta: {} }
      let locations = response.data;

      // If response has nested data array, extract it
      if (locations && typeof locations === 'object' && locations.data) {
        locations = locations.data;
      }

      // Ensure we have an array
      const items = Array.isArray(locations) ? locations : [];
      return items.map(item => ({ id: item.id, documentId: item.documentId, ...item }));
    } catch (error) {
      console.error('LocationRepository Error in findAll:', error);
      throw error;
    }
  }
}

