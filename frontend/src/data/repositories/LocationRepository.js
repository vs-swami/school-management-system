import { apiClient } from '../api/config';

export class LocationRepository {
  static async findAll(params = {}) {
    try {
      const defaultParams = {
        params: {
          filters: { is_active: true },
          fields: ['id', 'name'],
          sort: ['name:asc']
        }
      };
      const response = await apiClient.get('/locations', { ...defaultParams, ...params });
      // Strapi v4: data is in response.data.data
      const items = response.data?.data || [];
      return items.map(item => ({ id: item.id, ...(item.attributes || item) }));
    } catch (error) {
      console.error('LocationRepository Error in findAll:', error);
      throw error;
    }
  }
}

