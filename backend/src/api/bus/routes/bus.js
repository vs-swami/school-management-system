'use strict';

module.exports = {
  routes: [
    // Custom routes (must come before :id routes)
    {
      method: 'GET',
      path: '/buses/utilization',
      handler: 'bus.getBusUtilization',
    },
    {
      method: 'GET',
      path: '/buses/by-stop/:stopId',
      handler: 'bus.findByStop',
    },

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
      method: 'GET',
      path: '/buses/:id/available-seats',
      handler: 'bus.getAvailableSeats',
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
    }
  ],
};