
'use strict';

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::bus-stop.bus-stop', ({ strapi }) => ({
  async getStopsWithRoutes(busStopId) {
    try {
      const entry = await strapi.entityService.findOne('api::bus-stop.bus-stop', busStopId, {
        filters: { is_active: true },
        populate: {
          bus_routes: {
            populate: {
              bus: true
            }
          }
        }
      });
      return entry;
    } catch (error) {
      throw new Error(`Error getting stop with routes: ${error.message}`);        
    }
  },

  // Find nearby stops (if coordinates are available)
  async findNearbyStops(lat, lng, radiusKm = 5) {
    try {
      const stops = await strapi.entityService.findMany('api::bus-stop.bus-stop', {
        filters: { is_active: true }
      });

      const nearbyStops = stops.filter(stop => {
        if (!stop.coordinates || !stop.coordinates.lat || !stop.coordinates.lng) {
          return false;
        }

        const distance = this.calculateDistance(
          lat, lng, 
          stop.coordinates.lat, stop.coordinates.lng
        );

        return distance <= radiusKm;
      });

      return nearbyStops.map(stop => ({
        ...stop,
        distance: this.calculateDistance(
          lat, lng,
          stop.coordinates.lat, stop.coordinates.lng
        )
      })).sort((a, b) => a.distance - b.distance);
    } catch (error) {
      throw new Error(`Error finding nearby stops: ${error.message}`);
    }
  },

  // Calculate distance between two coordinates (Haversine formula)
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
  }
}));
