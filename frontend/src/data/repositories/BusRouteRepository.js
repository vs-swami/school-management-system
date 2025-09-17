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
      const populateParams = {
        populate: {
          bus: true
        }
      };
      const response = await apiClient.get(`/bus-routes/by-stop/${stopId}`, { params: populateParams });
      console.log('BusRouteRepository findByStop response:', response.data);
      return transformBusRouteResponse(response.data);
    } catch (error) {
      console.error('BusRouteRepository Error in findByStop:', error);
      throw error;
    }
  }
}
