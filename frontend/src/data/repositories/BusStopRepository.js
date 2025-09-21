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

  return transformed;
};

export class BusStopRepository {
  static async findAll(params = {}) {
    try {
      // Use populate * to get all relations
      const populateParams = {
        populate: '*'
      };

      const response = await apiClient.get('/bus-stops', {
        params: { ...params, ...populateParams }
      });

      // Strapi 5: Ensure we have an array
      const stopsData = Array.isArray(response.data) ? response.data :
                       (response.data?.data || []);
      return transformBusStopResponse(stopsData);
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
        populate: '*'
      };

      const response = await apiClient.get(`/bus-stops/${id}`, { params: populateParams });
      return transformBusStopResponse(response.data);
    } catch (error) {
      console.error('BusStopRepository Error in findById:', error);
      throw error;
    }
  }

  static async create(data) {
    try {
      const response = await apiClient.post('/bus-stops', { data });
      return transformBusStopResponse(response.data);
    } catch (error) {
      console.error('BusStopRepository Error in create:', error);
      throw error;
    }
  }

  static async update(idOrDocumentId, data) {
    try {
      // For Strapi v5, we need to use documentId for updates
      // If the id looks like a documentId (string), use it directly
      // Otherwise, we need to fetch the documentId first
      let updateId = idOrDocumentId;

      if (typeof idOrDocumentId === 'number' || /^\d+$/.test(idOrDocumentId)) {
        // This is a numeric ID, we need to get the documentId
        const busStop = await this.findById(idOrDocumentId);
        if (!busStop || !busStop.documentId) {
          throw new Error(`Bus stop with ID ${idOrDocumentId} not found or missing documentId`);
        }
        updateId = busStop.documentId;
      }

      // Ensure monthly_fee is properly formatted if present
      const updateData = { ...data };
      if (updateData.monthly_fee !== undefined) {
        updateData.monthly_fee = parseFloat(updateData.monthly_fee) || 0;
      }

      const response = await apiClient.put(`/bus-stops/${updateId}`, { data: updateData });
      return transformBusStopResponse(response.data);
    } catch (error) {
      console.error('BusStopRepository Error in update:', error);
      throw error;
    }
  }

  static async delete(idOrDocumentId) {
    try {
      // For Strapi v5, we need to use documentId for deletions
      // If the id looks like a documentId (string), use it directly
      // Otherwise, we need to fetch the documentId first
      let deleteId = idOrDocumentId;

      if (typeof idOrDocumentId === 'number' || /^\d+$/.test(idOrDocumentId)) {
        // This is a numeric ID, we need to get the documentId
        const busStop = await this.findById(idOrDocumentId);
        if (!busStop || !busStop.documentId) {
          throw new Error(`Bus stop with ID ${idOrDocumentId} not found or missing documentId`);
        }
        deleteId = busStop.documentId;
      }

      const response = await apiClient.delete(`/bus-stops/${deleteId}`);
      return response.data;
    } catch (error) {
      console.error('BusStopRepository Error in delete:', error);
      throw error;
    }
  }

  static async findByLocation(locationId) {
    try {
      const params = {
        filters: {
          is_active: { $eq: true },
          location: { id: { $eq: locationId } }
        },
        fields: ['id', 'stop_name'],
        populate: { location: { fields: ['id', 'name'] } },
        sort: ['stop_name:asc']
      };
      const response = await apiClient.get('/bus-stops', { params });
      return transformBusStopResponse(response.data);
    } catch (error) {
      console.error('BusStopRepository Error in findByLocation:', error);
      throw error;
    }
  }

  static async groupedByLocation() {
    try {
      const response = await apiClient.get('/bus-stops/grouped-by-location');
      return response.data; // already minimal shape for UI
    } catch (error) {
      console.error('BusStopRepository Error in groupedByLocation:', error);
      throw error;
    }
  }

  static async findWithFees(params = {}) {
    try {
      const populateParams = {
        populate: {
          location: true,
          bus_routes: true,
          pickup_allocations: {
            count: true
          }
        },
        filters: {
          is_active: { $eq: true }
        },
        sort: ['stop_name:asc']
      };

      const response = await apiClient.get('/bus-stops', {
        params: { ...params, ...populateParams }
      });

      const stopsData = Array.isArray(response.data) ? response.data :
                       (response.data?.data || []);

      // Transform and include fee information
      return stopsData.map(stop => ({
        ...transformBusStopResponse(stop),
        monthlyFee: stop.monthly_fee || 0,
        studentCount: stop.pickup_allocations?.count || 0
      }));
    } catch (error) {
      console.error('BusStopRepository Error in findWithFees:', error);
      throw error;
    }
  }

  static async bulkUpdateFees(updates) {
    try {
      const updatePromises = updates.map(({ id, documentId, monthly_fee }) => {
        const updateId = documentId || id;
        return this.update(updateId, { monthly_fee });
      });

      const results = await Promise.allSettled(updatePromises);
      return {
        successful: results.filter(r => r.status === 'fulfilled').map(r => r.value),
        failed: results.filter(r => r.status === 'rejected').map(r => r.reason)
      };
    } catch (error) {
      console.error('BusStopRepository Error in bulkUpdateFees:', error);
      throw error;
    }
  }
}
