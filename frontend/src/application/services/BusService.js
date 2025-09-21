import { BusRepositoryAdapter } from '../../data/adapters/BusRepositoryAdapter';

export class BusService {
  constructor() {
    this.repository = new BusRepositoryAdapter();
  }

  async getAllBuses() {
    try {
      const buses = await this.repository.findAll();
      return {
        success: true,
        data: buses,
      };
    } catch (error) {
      console.error('Error in BusService.getAllBuses:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch buses',
      };
    }
  }

  async getBusById(id) {
    try {
      const bus = await this.repository.findById(id);
      return {
        success: true,
        data: bus,
      };
    } catch (error) {
      console.error('Error in BusService.getBusById:', error);
      return {
        success: false,
        error: error.message || `Failed to fetch bus with id ${id}`,
      };
    }
  }

  async getActiveBuses() {
    try {
      const buses = await this.repository.findActive();
      return {
        success: true,
        data: buses,
      };
    } catch (error) {
      console.error('Error in BusService.getActiveBuses:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch active buses',
      };
    }
  }

  async createBus(busData) {
    try {
      const newBus = await this.repository.create(busData);
      return {
        success: true,
        data: newBus,
      };
    } catch (error) {
      console.error('Error in BusService.createBus:', error);
      return {
        success: false,
        error: error.message || 'Failed to create bus',
      };
    }
  }

  async updateBus(id, busData) {
    try {
      const updatedBus = await this.repository.update(id, busData);
      return {
        success: true,
        data: updatedBus,
      };
    } catch (error) {
      console.error('Error in BusService.updateBus:', error);
      return {
        success: false,
        error: error.message || `Failed to update bus with id ${id}`,
      };
    }
  }

  async deleteBus(id) {
    try {
      const result = await this.repository.delete(id);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error('Error in BusService.deleteBus:', error);
      return {
        success: false,
        error: error.message || `Failed to delete bus with id ${id}`,
      };
    }
  }

  async getBusByRoute(routeId) {
    try {
      const buses = await this.repository.findByRoute(routeId);
      return {
        success: true,
        data: buses,
      };
    } catch (error) {
      console.error('Error in BusService.getBusByRoute:', error);
      return {
        success: false,
        error: error.message || `Failed to fetch buses for route ${routeId}`,
      };
    }
  }

  async getAvailableBuses() {
    try {
      const buses = await this.repository.findAvailable();
      return {
        success: true,
        data: buses,
      };
    } catch (error) {
      console.error('Error in BusService.getAvailableBuses:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch available buses',
      };
    }
  }
}