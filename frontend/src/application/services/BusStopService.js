import { BusStopRepositoryAdapter } from '../../data/adapters/BusStopRepositoryAdapter';
import { LocationRepository } from '../../data/repositories/LocationRepository';

export class BusStopService {
  constructor() {
    this.repository = new BusStopRepositoryAdapter();
    this.locationRepository = LocationRepository; // TODO: Create LocationRepositoryAdapter
  }

  async getAllBusStops() {
    try {
      const busStops = await this.repository.findAll();
      return {
        success: true,
        data: busStops,
      };
    } catch (error) {
      console.error('Error in BusStopService.getAllBusStops:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch bus stops',
      };
    }
  }

  async getActiveBusStops() {
    try {
      const busStops = await this.repository.findActiveStops();
      return {
        success: true,
        data: busStops,
      };
    } catch (error) {
      console.error('Error in BusStopService.getActiveBusStops:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch active bus stops',
      };
    }
  }

  async getBusStopById(id) {
    try {
      const busStop = await this.repository.findById(id);
      return {
        success: true,
        data: busStop,
      };
    } catch (error) {
      console.error('Error in BusStopService.getBusStopById:', error);
      return {
        success: false,
        error: error.message || `Failed to fetch bus stop with id ${id}`,
      };
    }
  }

  async createBusStop(busStopData) {
    try {
      const newBusStop = await this.repository.create(busStopData);
      return {
        success: true,
        data: newBusStop,
      };
    } catch (error) {
      console.error('Error in BusStopService.createBusStop:', error);
      return {
        success: false,
        error: error.message || 'Failed to create bus stop',
      };
    }
  }

  async updateBusStop(id, busStopData) {
    try {
      const updatedBusStop = await this.repository.update(id, busStopData);
      return {
        success: true,
        data: updatedBusStop,
      };
    } catch (error) {
      console.error('Error in BusStopService.updateBusStop:', error);
      return {
        success: false,
        error: error.message || `Failed to update bus stop with id ${id}`,
      };
    }
  }

  async deleteBusStop(id) {
    try {
      const result = await this.repository.delete(id);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error('Error in BusStopService.deleteBusStop:', error);
      return {
        success: false,
        error: error.message || `Failed to delete bus stop with id ${id}`,
      };
    }
  }

  async getBusStopsByRoute(routeId) {
    try {
      const busStops = await this.repository.findByRoute(routeId);
      return {
        success: true,
        data: busStops,
      };
    } catch (error) {
      console.error('Error in BusStopService.getBusStopsByRoute:', error);
      return {
        success: false,
        error: error.message || `Failed to fetch bus stops for route ${routeId}`,
      };
    }
  }

  async getBusStopsByLocation(locationId) {
    try {
      const busStops = await this.repository.findByLocation(locationId);
      return {
        success: true,
        data: busStops,
      };
    } catch (error) {
      console.error('Error in BusStopService.getBusStopsByLocation:', error);
      return {
        success: false,
        error: error.message || `Failed to fetch bus stops for location ${locationId}`,
      };
    }
  }

  async getBusStopWithStudents(id) {
    try {
      const busStop = await this.repository.findWithStudents(id);
      return {
        success: true,
        data: busStop,
      };
    } catch (error) {
      console.error('Error in BusStopService.getBusStopWithStudents:', error);
      return {
        success: false,
        error: error.message || `Failed to fetch bus stop with students for id ${id}`,
      };
    }
  }

  async updateBusStopCoordinates(id, coordinates) {
    try {
      const updatedBusStop = await this.repository.updateCoordinates(id, coordinates);
      return {
        success: true,
        data: updatedBusStop,
      };
    } catch (error) {
      console.error('Error in BusStopService.updateBusStopCoordinates:', error);
      return {
        success: false,
        error: error.message || `Failed to update coordinates for bus stop ${id}`,
      };
    }
  }

  async assignBusStopToRoute(stopId, routeId) {
    try {
      const result = await this.repository.assignToRoute(stopId, routeId);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error('Error in BusStopService.assignBusStopToRoute:', error);
      return {
        success: false,
        error: error.message || `Failed to assign bus stop ${stopId} to route ${routeId}`,
      };
    }
  }

  async removeBusStopFromRoute(stopId, routeId) {
    try {
      const result = await this.repository.removeFromRoute(stopId, routeId);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error('Error in BusStopService.removeBusStopFromRoute:', error);
      return {
        success: false,
        error: error.message || `Failed to remove bus stop ${stopId} from route ${routeId}`,
      };
    }
  }

  // Location related methods (still using old repository for now)
  async getAllLocations() {
    try {
      const locations = await this.locationRepository.findAll();
      return {
        success: true,
        data: locations || [],
      };
    } catch (error) {
      console.error('Error in BusStopService.getAllLocations:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch locations',
        data: [],
      };
    }
  }

  // Fee management methods
  async updateBusStopFee(id, feeAmount) {
    try {
      const updatedBusStop = await this.repository.update(id, { monthly_fee: feeAmount });
      return {
        success: true,
        data: updatedBusStop,
      };
    } catch (error) {
      console.error('Error in BusStopService.updateBusStopFee:', error);
      return {
        success: false,
        error: error.message || `Failed to update fee for bus stop ${id}`,
      };
    }
  }

  async getBusStopsWithFees() {
    try {
      const busStops = await this.repository.findAll({
        populate: {
          location: true,
          bus_routes: true,
        },
      });

      // Filter and format for fee management
      const stopsWithFees = busStops.map(stop => ({
        id: stop.id,
        documentId: stop.documentId,
        stopName: stop.stopName || stop.stop_name,
        stopCode: stop.stopCode || stop.stop_code,
        location: stop.location,
        monthlyFee: stop.monthlyFee || stop.monthly_fee || 0,
        routes: stop.bus_routes || stop.routes || [],
        studentCount: stop.pickup_allocations?.length || 0,
        isActive: stop.isActive || stop.is_active,
      }));

      return {
        success: true,
        data: stopsWithFees,
      };
    } catch (error) {
      console.error('Error in BusStopService.getBusStopsWithFees:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch bus stops with fees',
      };
    }
  }

  async bulkUpdateFees(updates) {
    try {
      const results = await Promise.allSettled(
        updates.map(({ id, fee }) => this.updateBusStopFee(id, fee))
      );

      const successful = results.filter(r => r.status === 'fulfilled' && r.value.success);
      const failed = results.filter(r => r.status === 'rejected' || !r.value?.success);

      return {
        success: failed.length === 0,
        data: {
          updated: successful.length,
          failed: failed.length,
          results: results.map(r => r.value || { success: false }),
        },
      };
    } catch (error) {
      console.error('Error in BusStopService.bulkUpdateFees:', error);
      return {
        success: false,
        error: error.message || 'Failed to bulk update fees',
      };
    }
  }

  // Helper method to prepare bus stop data for saving
  prepareBusStopData(formData) {
    const busStopData = {
      stopName: formData.stop_name,
      stopCode: formData.stop_code,
      location: formData.location,
      isActive: formData.is_active,
      notes: formData.notes,
      monthlyFee: formData.monthly_fee,
      pickupTime: formData.pickup_time,
      dropTime: formData.drop_time,
    };

    // Handle coordinates if provided
    if (formData.latitude && formData.longitude) {
      busStopData.coordinates = {
        lat: parseFloat(formData.latitude),
        lng: parseFloat(formData.longitude),
      };
    }

    return busStopData;
  }

  // Validation helper
  validateBusStopData(data) {
    const errors = {};

    if (!data.stop_name || data.stop_name.trim() === '') {
      errors.stop_name = 'Stop name is required';
    }

    if (!data.location && !data.latitude && !data.longitude) {
      errors.location = 'Either location or coordinates are required';
    }

    if (data.latitude && (isNaN(data.latitude) || data.latitude < -90 || data.latitude > 90)) {
      errors.latitude = 'Invalid latitude value';
    }

    if (data.longitude && (isNaN(data.longitude) || data.longitude < -180 || data.longitude > 180)) {
      errors.longitude = 'Invalid longitude value';
    }

    if (data.monthly_fee && isNaN(data.monthly_fee)) {
      errors.monthly_fee = 'Monthly fee must be a number';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }
}