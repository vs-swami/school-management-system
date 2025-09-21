// Strapi 5: Return raw API data - all transformations handled by mappers
import { apiClient } from '../api/config';

export class BusRouteRepository {
  static async findByStop(stopId) {
    try {
      const idNum = Number(stopId);
      const params = {
        filters: { bus_stops: { id: { $eq: isNaN(idNum) ? stopId : idNum } } },
        populate: {
          bus: true,
          bus_stops: true,
          stop_schedules: {
            populate: '*'  // Populate all fields in the component including bus_stop relation
          }
        },
        sort: ['route_name:asc']
      };
      const response = await apiClient.get('/bus-routes', { params });
      return response.data.data || response.data || [];
    } catch (error) {
      console.error('BusRouteRepository Error in findByStop:', error);
      throw error;
    }
  }

  static async findByLocation(locationId) {
    try {
      const idNum = Number(locationId);

      // First try to get all routes and filter client-side
      // This is a workaround for complex nested filtering
      const params = {
        populate: {
          bus: true,
          bus_stops: {
            populate: {
              location: true
            }
          },
          stop_schedules: {
            populate: '*'  // Populate all fields in the component including bus_stop relation
          }
        },
        sort: ['route_name:asc'],
        pagination: {
          pageSize: 100
        }
      };

      console.log('Fetching all routes to filter by location:', locationId);
      const response = await apiClient.get('/bus-routes', { params });

      // Handle Strapi 5 response structure
      console.log('Raw API response:', response.data);
      const allRoutes = response.data.data || response.data || [];
      console.log('Raw routes from API:', allRoutes);

      // Filter routes that have the specified location in either bus_stops or stop_schedules
      const filteredRoutes = allRoutes.filter(route => {
        // Check bus_stops relation
        if (route.bus_stops && route.bus_stops.length > 0) {
          const hasLocation = route.bus_stops.some(stop =>
            stop.location && (stop.location.id === idNum || stop.location === idNum)
          );
          if (hasLocation) return true;
        }

        // Check stop_schedules component
        if (route.stop_schedules && route.stop_schedules.length > 0) {
          const hasLocation = route.stop_schedules.some(schedule =>
            schedule.bus_stop && schedule.bus_stop.location &&
            (schedule.bus_stop.location.id === idNum || schedule.bus_stop.location === idNum)
          );
          if (hasLocation) return true;
        }

        return false;
      });

      console.log(`Found ${filteredRoutes.length} routes for location ${locationId}`);
      return filteredRoutes;
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
          },
          stop_schedules: {
            populate: '*'  // Populate all fields in the component including bus_stop relation
          }
        },
        sort: ['route_name:asc'],
        pagination: {
          pageSize: 100
        }
      };
      const response = await apiClient.get('/bus-routes', { params });
      return response.data.data || response.data || [];
    } catch (error) {
      console.error('BusRouteRepository Error in findAll:', error);
      throw error;
    }
  }

  static async create(routeData) {
    try {
      const response = await apiClient.post('/bus-routes', { data: routeData });
      return response.data.data || response.data;
    } catch (error) {
      console.error('BusRouteRepository Error in create:', error);
      throw error;
    }
  }

  static async update(id, routeData) {
    try {
      const response = await apiClient.put(`/bus-routes/${id}`, { data: routeData });
      return response.data.data || response.data;
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