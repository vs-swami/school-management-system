'use strict';

module.exports = {
  routes: [
    // Default CRUD routes
    {
      method: 'GET',
      path: '/buses',
      handler: 'bus.find',
    },
    {
      method: 'GET',
      path: '/buses/:id',
      handler: 'bus.findOne',
    },
    {
      method: 'POST',
      path: '/buses',
      handler: 'bus.create',
    },
    {
      method: 'PUT',
      path: '/buses/:id',
      handler: 'bus.update',
    },
    {
      method: 'DELETE',
      path: '/buses/:id',
      handler: 'bus.delete',
    },
    
    // Custom routes
    {
      method: 'GET',
      path: '/buses/:id/available-seats',
      handler: 'bus.getAvailableSeats',
    },
    {
      method: 'GET',
      path: '/buses/utilization',
      handler: 'bus.getBusUtilization',
    },
    {
      method: 'GET',
      path: '/buses/by-stop/:stopId',
      handler: 'bus.findByStop',
    }
  ],
};