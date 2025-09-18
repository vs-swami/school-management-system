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
}
