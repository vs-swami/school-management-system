import { BusRouteRepositoryAdapter } from '../../data/adapters/BusRouteRepositoryAdapter';

export class BusRouteService {
  constructor() {
    this.repository = new BusRouteRepositoryAdapter();
  }

  async getAllRoutes() {
    try {
      const routes = await this.repository.findAll();
      return {
        success: true,
        data: routes,
      };
    } catch (error) {
      console.error('Error in BusRouteService.getAllRoutes:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch routes',
      };
    }
  }

  async getRouteById(id) {
    try {
      const route = await this.repository.findById(id);
      return {
        success: true,
        data: route,
      };
    } catch (error) {
      console.error('Error in BusRouteService.getRouteById:', error);
      return {
        success: false,
        error: error.message || `Failed to fetch route with id ${id}`,
      };
    }
  }

  async getActiveRoutes() {
    try {
      const routes = await this.repository.findActiveRoutes();
      return {
        success: true,
        data: routes,
      };
    } catch (error) {
      console.error('Error in BusRouteService.getActiveRoutes:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch active routes',
      };
    }
  }

  async createRoute(routeData) {
    try {
      const newRoute = await this.repository.create(routeData);
      return {
        success: true,
        data: newRoute,
      };
    } catch (error) {
      console.error('Error in BusRouteService.createRoute:', error);
      return {
        success: false,
        error: error.message || 'Failed to create route',
      };
    }
  }

  async updateRoute(id, routeData) {
    try {
      const updatedRoute = await this.repository.update(id, routeData);
      return {
        success: true,
        data: updatedRoute,
      };
    } catch (error) {
      console.error('Error in BusRouteService.updateRoute:', error);
      return {
        success: false,
        error: error.message || `Failed to update route with id ${id}`,
      };
    }
  }

  async deleteRoute(id) {
    try {
      const result = await this.repository.delete(id);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error('Error in BusRouteService.deleteRoute:', error);
      return {
        success: false,
        error: error.message || `Failed to delete route with id ${id}`,
      };
    }
  }

  async addStopToRoute(routeId, stopId, order) {
    try {
      const result = await this.repository.addStop(routeId, stopId, order);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error('Error in BusRouteService.addStopToRoute:', error);
      return {
        success: false,
        error: error.message || `Failed to add stop to route`,
      };
    }
  }

  async removeStopFromRoute(routeId, stopId) {
    try {
      const result = await this.repository.removeStop(routeId, stopId);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error('Error in BusRouteService.removeStopFromRoute:', error);
      return {
        success: false,
        error: error.message || `Failed to remove stop from route`,
      };
    }
  }

  async reorderStops(routeId, stopIds) {
    try {
      const result = await this.repository.reorderStops(routeId, stopIds);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error('Error in BusRouteService.reorderStops:', error);
      return {
        success: false,
        error: error.message || `Failed to reorder stops`,
      };
    }
  }

  async findByStop(stopId) {
    try {
      const routes = await this.repository.findByStop(stopId);
      return {
        success: true,
        data: routes,
      };
    } catch (error) {
      console.error('Error in BusRouteService.findByStop:', error);
      return {
        success: false,
        error: error.message || `Failed to find routes for stop ${stopId}`,
        data: []
      };
    }
  }

  async findByLocation(locationId) {
    try {
      const routes = await this.repository.findByLocation(locationId);
      return {
        success: true,
        data: routes,
      };
    } catch (error) {
      console.error('Error in BusRouteService.findByLocation:', error);
      return {
        success: false,
        error: error.message || `Failed to find routes for location ${locationId}`,
        data: []
      };
    }
  }
}