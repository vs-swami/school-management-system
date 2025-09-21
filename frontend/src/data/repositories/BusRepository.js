import { apiClient } from '../api/config';

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
      return response.data;
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
      return response.data;
    } catch (error) {
      console.error('BusRepository Error in findById:', error);
      throw error;
    }
  }

  static async create(busData) {
    try {
      const response = await apiClient.post('/buses', { data: busData });
      return response.data;
    } catch (error) {
      console.error('BusRepository Error in create:', error);
      throw error;
    }
  }

  static async update(id, busData) {
    try {
      const response = await apiClient.put(`/buses/${id}`, { data: busData });
      return response.data;
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
      return response.data;
    } catch (error) {
      console.error('BusRepository Error in updateStatus:', error);
      throw error;
    }
  }
}