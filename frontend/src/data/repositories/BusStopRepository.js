import { apiClient } from '../api/config';

const transformBusStopResponse = (busStopData) => {
  if (!busStopData) return null;

  if (Array.isArray(busStopData)) {
    return busStopData.map(item => transformBusStopResponse(item));
  }

  const transformed = {
    id: busStopData.id,
    documentId: busStopData.documentId,
    ...busStopData,
  };

  // Normalize relations if they exist
  const normalizeRelation = (relation) => {
    if (!relation) return null;
    if (Array.isArray(relation)) return relation;
    if (relation.data) return relation.data;
    return relation;
  };

  transformed.bus_routes = normalizeRelation(transformed.bus_routes);
  transformed.pickup_allocations = normalizeRelation(transformed.pickup_allocations);
  transformed.drop_allocations = normalizeRelation(transformed.drop_allocations);

  return transformed;
};

export class BusStopRepository {
  static async findAll(params = {}) {
    try {
      const populateParams = {
        populate: {
          bus_routes: {
            populate: {
              bus: true
            }
          },
          pickup_allocations: true,
          drop_allocations: true,
        }
      };

      const response = await apiClient.get('/bus-stops', {
        params: { ...params, ...populateParams }
      });

      return transformBusStopResponse(response.data.data);
    } catch (error) {
      console.error('BusStopRepository Error in findAll:', error);
      throw error;
    }
  }

  static async getStopsWithRoutes(busStopId) {
    try {
      const populateParams = {
        populate: {
          bus_routes: true,
        },
      };
      const response = await apiClient.get(`/bus-stops/with-routes/${busStopId}`, { params: populateParams });
      console.log('BusStopRepository getStopsWithRoutes response:', response);
      return transformBusStopResponse(response.data);
    } catch (error) {
      console.error('BusStopRepository Error in getStopsWithRoutes:', error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const populateParams = {
        populate: {
          bus_routes: true,
          pickup_allocations: true,
          drop_allocations: true,
        }
      };

      const response = await apiClient.get(`/bus-stops/${id}`, { params: populateParams });
      return transformBusStopResponse(response.data.data);
    } catch (error) {
      console.error('BusStopRepository Error in findById:', error);
      throw error;
    }
  }

  static async create(data) {
    try {
      const response = await apiClient.post('/bus-stops', { data });
      return transformBusStopResponse(response.data.data);
    } catch (error) {
      console.error('BusStopRepository Error in create:', error);
      throw error;
    }
  }

  static async update(id, data) {
    try {
      const response = await apiClient.put(`/bus-stops/${id}`, { data });
      return transformBusStopResponse(response.data.data);
    } catch (error) {
      console.error('BusStopRepository Error in update:', error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      const response = await apiClient.delete(`/bus-stops/${id}`);
      return response.data;
    } catch (error) {
      console.error('BusStopRepository Error in delete:', error);
      throw error;
    }
  }
}
