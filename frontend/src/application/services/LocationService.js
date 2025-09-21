import { LocationRepositoryAdapter } from '../../data/adapters/LocationRepositoryAdapter';

export class LocationService {
  constructor() {
    this.repository = new LocationRepositoryAdapter();
  }

  async getAllLocations() {
    try {
      const locations = await this.repository.findAll();
      return {
        success: true,
        data: locations,
      };
    } catch (error) {
      console.error('Error in LocationService.getAllLocations:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch locations',
      };
    }
  }

  async getLocationById(id) {
    try {
      const location = await this.repository.findById(id);
      return {
        success: true,
        data: location,
      };
    } catch (error) {
      console.error('Error in LocationService.getLocationById:', error);
      return {
        success: false,
        error: error.message || `Failed to fetch location with id ${id}`,
      };
    }
  }

  async createLocation(locationData) {
    try {
      const newLocation = await this.repository.create(locationData);
      return {
        success: true,
        data: newLocation,
      };
    } catch (error) {
      console.error('Error in LocationService.createLocation:', error);
      return {
        success: false,
        error: error.message || 'Failed to create location',
      };
    }
  }

  async updateLocation(id, locationData) {
    try {
      const updatedLocation = await this.repository.update(id, locationData);
      return {
        success: true,
        data: updatedLocation,
      };
    } catch (error) {
      console.error('Error in LocationService.updateLocation:', error);
      return {
        success: false,
        error: error.message || `Failed to update location with id ${id}`,
      };
    }
  }

  async deleteLocation(id) {
    try {
      const result = await this.repository.delete(id);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error('Error in LocationService.deleteLocation:', error);
      return {
        success: false,
        error: error.message || `Failed to delete location with id ${id}`,
      };
    }
  }

  async getLocationsByType(type) {
    try {
      const locations = await this.repository.findByType(type);
      return {
        success: true,
        data: locations,
      };
    } catch (error) {
      console.error('Error in LocationService.getLocationsByType:', error);
      return {
        success: false,
        error: error.message || `Failed to fetch locations of type ${type}`,
      };
    }
  }
}