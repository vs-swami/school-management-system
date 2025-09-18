'use strict';

module.exports = {
  routes: [
    // Default CRUD routes
    {
      method: 'GET',
      path: '/locations',
      handler: 'location.find',
    },
    {
      method: 'GET',
      path: '/locations/:id',
      handler: 'location.findOne',
    },
    {
      method: 'POST',
      path: '/locations',
      handler: 'location.create',
    },
    {
      method: 'PUT',
      path: '/locations/:id',
      handler: 'location.update',
    },
    {
      method: 'DELETE',
      path: '/locations/:id',
      handler: 'location.delete',
    },
  ],
};

