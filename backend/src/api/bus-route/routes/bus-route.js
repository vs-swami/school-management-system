'use strict';

module.exports = {
  routes: [
    // Default CRUD routes
    {
      method: 'GET',
      path: '/bus-routes',
      handler: 'bus-route.find',
    },
    {
      method: 'GET',
      path: '/bus-routes/:id',
      handler: 'bus-route.findOne',
    },
    {
      method: 'POST',
      path: '/bus-routes',
      handler: 'bus-route.create',
    },
    {
      method: 'PUT',
      path: '/bus-routes/:id',
      handler: 'bus-route.update',
    },
    {
      method: 'DELETE',
      path: '/bus-routes/:id',
      handler: 'bus-route.delete',
    },
    
    // Custom routes
    {
      method: 'GET',
      path: '/bus-routes/by-bus/:busId',
      handler: 'bus-route.findByBus',
    },
    {
      method: 'GET',
      path: '/bus-routes/by-stop/:stopId',
      handler: 'bus-route.findByStop',
    },
    {
      method: 'PUT',
      path: '/bus-routes/:id/stop-order',
      handler: 'bus-route.updateStopOrder',
    },
    {
      method: 'GET',
      path: '/bus-routes/:id/schedule',
      handler: 'bus-route.getSchedule',
    }
  ],
};