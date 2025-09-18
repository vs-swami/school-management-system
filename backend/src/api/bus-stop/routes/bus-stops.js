'use strict';

module.exports = {
  routes: [
    // Default CRUD routes
    {
      method: 'GET',
      path: '/bus-stops',
      handler: 'bus-stop.find',
    },
    // Custom helpers
    {
      method: 'GET',
      path: '/bus-stops/by-location/:locationId',
      handler: 'bus-stop.findByLocation',
    },
    {
      method: 'GET',
      path: '/bus-stops/grouped-by-location',
      handler: 'bus-stop.groupedByLocation',
    },
    {
      method: 'GET',
      path: '/bus-stops/with-routes/:id',
      handler: 'bus-stop.findStopsWithRoutes',
    },
    {
      method: 'GET',
      path: '/bus-stops/:id',
      handler: 'bus-stop.findOne',
    },
    {
      method: 'POST',
      path: '/bus-stops',
      handler: 'bus-stop.create',
    },
    {
      method: 'PUT',
      path: '/bus-stops/:id',
      handler: 'bus-stop.update',
    },
    {
      method: 'DELETE',
      path: '/bus-stops/:id',
      handler: 'bus-stop.delete',
    }
  ],
};
