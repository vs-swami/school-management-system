import { apiClient } from '../api/config';

const transformBusRouteResponse = (busRouteData) => {
  if (!busRouteData) return null;

  if (Array.isArray(busRouteData)) {
    return busRouteData.map(item => transformBusRouteResponse(item));
  }

  const transformed = {
    id: busRouteData.id,
    documentId: busRouteData.documentId,
    ...busRouteData,
  };

  // Normalize relations if they exist
  const normalizeRelation = (relation) => {
    if (!relation) return null;
    if (Array.isArray(relation)) return relation;
    if (relation.data) return relation.data;
    return relation;
  };

  transformed.bus = normalizeRelation(transformed.bus);
  transformed.bus_stops = normalizeRelation(transformed.bus_stops);

  return transformed;
};

export class BusRouteRepository {
  static async findByStop(stopId) {
    try {
      const idNum = Number(stopId);
      const params = {
        filters: { bus_stops: { id: { $eq: isNaN(idNum) ? stopId : idNum } } },
        populate: { bus: true, bus_stops: true },
        sort: ['route_name:asc']
      };
      const response = await apiClient.get('/bus-routes', { params });
      return transformBusRouteResponse(response.data.data);
    } catch (error) {
      console.error('BusRouteRepository Error in findByStop:', error);
      throw error;
    }
  }

  static async findByLocation(locationId) {
    try {
      const idNum = Number(locationId);
      const params = {
        filters: { bus_stops: { location: { id: { $eq: isNaN(idNum) ? locationId : idNum } } } },
        populate: { bus: true, bus_stops: true },
        sort: ['route_name:asc']
      };
      const response = await apiClient.get('/bus-routes', { params });
      return transformBusRouteResponse(response.data.data);
    } catch (error) {
      console.error('BusRouteRepository Error in findByLocation:', error);
      throw error;
    }
  }

  static async findAll() {
    try {
      const params = {
        populate: {
          bus: true,
          bus_stops: {
            populate: {
              location: true
            }
          }
        },
        sort: ['route_name:asc'],
        pagination: {
          pageSize: 100
        }
      };
      const response = await apiClient.get('/bus-routes', { params });
      return transformBusRouteResponse(response.data.data);
    } catch (error) {
      console.error('BusRouteRepository Error in findAll:', error);
      throw error;
    }
  }

  static async create(routeData) {
    try {
      const response = await apiClient.post('/bus-routes', { data: routeData });
      return transformBusRouteResponse(response.data.data);
    } catch (error) {
      console.error('BusRouteRepository Error in create:', error);
      throw error;
    }
  }

  static async update(id, routeData) {
    try {
      const response = await apiClient.put(`/bus-routes/${id}`, { data: routeData });
      return transformBusRouteResponse(response.data.data);
    } catch (error) {
      console.error('BusRouteRepository Error in update:', error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      const response = await apiClient.delete(`/bus-routes/${id}`);
      return response.data;
    } catch (error) {
      console.error('BusRouteRepository Error in delete:', error);
      throw error;
    }
  }
}
