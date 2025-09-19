import { apiClient } from '../api/config';

const transformBusResponse = (busData) => {
  if (!busData) return null;

  if (Array.isArray(busData)) {
    return busData.map(item => transformBusResponse(item));
  }

  const transformed = {
    id: busData.id,
    documentId: busData.documentId,
    ...busData,
  };

  // Normalize relations if they exist
  const normalizeRelation = (relation) => {
    if (!relation) return null;
    if (Array.isArray(relation)) return relation;
    if (relation.data) return relation.data;
    return relation;
  };

  transformed.bus_routes = normalizeRelation(transformed.bus_routes);
  transformed.seat_allocations = normalizeRelation(transformed.seat_allocations);

  return transformed;
};

export class BusRepository {
  static async findAll() {
    try {
      const params = {
        populate: {
          bus_routes: {
            populate: {
              bus_stops: true
            }
          },
          seat_allocations: true
        },
        sort: ['bus_number:asc'],
        pagination: {
          pageSize: 100
        }
      };
      const response = await apiClient.get('/buses', { params });
      return transformBusResponse(response.data.data);
    } catch (error) {
      console.error('BusRepository Error in findAll:', error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const params = {
        populate: {
          bus_routes: {
            populate: {
              bus_stops: true
            }
          },
          seat_allocations: {
            populate: {
              student: true,
              pickup_stop: true
            }
          }
        }
      };
      const response = await apiClient.get(`/buses/${id}`, { params });
      return transformBusResponse(response.data.data);
    } catch (error) {
      console.error('BusRepository Error in findById:', error);
      throw error;
    }
  }

  static async create(busData) {
    try {
      const response = await apiClient.post('/buses', { data: busData });
      return transformBusResponse(response.data.data);
    } catch (error) {
      console.error('BusRepository Error in create:', error);
      throw error;
    }
  }

  static async update(id, busData) {
    try {
      const response = await apiClient.put(`/buses/${id}`, { data: busData });
      return transformBusResponse(response.data.data);
    } catch (error) {
      console.error('BusRepository Error in update:', error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      const response = await apiClient.delete(`/buses/${id}`);
      return response.data;
    } catch (error) {
      console.error('BusRepository Error in delete:', error);
      throw error;
    }
  }

  static async getAvailableSeats(busId) {
    try {
      const bus = await this.findById(busId);
      if (!bus) throw new Error('Bus not found');

      const totalSeats = bus.total_seats || 50;
      const allocatedSeats = bus.seat_allocations?.length || 0;
      const availableSeats = totalSeats - allocatedSeats;

      return {
        totalSeats,
        allocatedSeats,
        availableSeats,
        utilization: Math.round((allocatedSeats / totalSeats) * 100)
      };
    } catch (error) {
      console.error('BusRepository Error in getAvailableSeats:', error);
      throw error;
    }
  }

  static async updateStatus(id, status) {
    try {
      const response = await apiClient.put(`/buses/${id}`, {
        data: { status }
      });
      return transformBusResponse(response.data.data);
    } catch (error) {
      console.error('BusRepository Error in updateStatus:', error);
      throw error;
    }
  }
}