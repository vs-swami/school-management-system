'use strict';

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::bus-route.bus-route', ({ strapi }) => ({
  
  // Optimize route stop order based on coordinates
  async optimizeStopOrder(routeId) {
    try {
      const route = await strapi.entityService.findOne('api::bus-route.bus-route', routeId, {
        populate: { bus_stops: true }
      });

      if (!route || !route.bus_stops.length) {
        return null;
      }

      // Simple optimization: sort by coordinates if available
      const stopsWithCoords = route.bus_stops.filter(stop => 
        stop.coordinates && stop.coordinates.lat && stop.coordinates.lng
      );

      if (stopsWithCoords.length === 0) {
        return route.stop_order;
      }

      // Sort by latitude first, then longitude (simple linear optimization)
      const optimizedStops = stopsWithCoords.sort((a, b) => {
        if (a.coordinates.lat !== b.coordinates.lat) {
          return a.coordinates.lat - b.coordinates.lat;
        }
        return a.coordinates.lng - b.coordinates.lng;
      });

      const optimizedOrder = optimizedStops.map(stop => stop.id);
      
      // Add stops without coordinates at the end
      const stopsWithoutCoords = route.bus_stops
        .filter(stop => !stop.coordinates || !stop.coordinates.lat || !stop.coordinates.lng)
        .map(stop => stop.id);

      return [...optimizedOrder, ...stopsWithoutCoords];
    } catch (error) {
      throw new Error(`Error optimizing stop order: ${error.message}`);
    }
  },

  // Calculate total route distance
  async calculateRouteDistance(routeId) {
    try {
      const route = await strapi.entityService.findOne('api::bus-route.bus-route', routeId, {
        populate: { bus_stops: true }
      });

      if (!route || !route.stop_order || route.stop_order.length < 2) {
        return 0;
      }

      let totalDistance = 0;
      
      for (let i = 0; i < route.stop_order.length - 1; i++) {
        const currentStopId = route.stop_order[i];
        const nextStopId = route.stop_order[i + 1];
        
        const currentStop = route.bus_stops.find(stop => stop.id === currentStopId);
        const nextStop = route.bus_stops.find(stop => stop.id === nextStopId);
        
        if (currentStop?.coordinates && nextStop?.coordinates) {
          const distance = this.calculateDistance(
            currentStop.coordinates.lat, currentStop.coordinates.lng,
            nextStop.coordinates.lat, nextStop.coordinates.lng
          );
          totalDistance += distance;
        }
      }

      return Math.round(totalDistance * 100) / 100; // Round to 2 decimal places
    } catch (error) {
      throw new Error(`Error calculating route distance: ${error.message}`);
    }
  },

  // Calculate distance between two coordinates
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const d = R * c;
    return d;
  },

  deg2rad(deg) {
    return deg * (Math.PI/180);
  },

  async findByStop(stopId) {
    try {
      const routes = await strapi.entityService.findMany('api::bus-route.bus-route', {
        filters: {
          bus_stops: { id: stopId }
        },
        populate: {
          bus: true,
          bus_stops: true
        }
      });

      return routes;
    } catch (error) {
      throw new Error(`Error finding routes by stop: ${error.message}`);
    }
  }
}));