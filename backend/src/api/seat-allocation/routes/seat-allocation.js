'use strict';

module.exports = {
  routes: [
    // Default CRUD routes
    {
      method: 'GET',
      path: '/seat-allocations',
      handler: 'seat-allocation.find',
    },
    {
      method: 'GET',
      path: '/seat-allocations/:id',
      handler: 'seat-allocation.findOne',
    },
    {
      method: 'POST',
      path: '/seat-allocations',
      handler: 'seat-allocation.create',
    },
    {
      method: 'PUT',
      path: '/seat-allocations/:id',
      handler: 'seat-allocation.update',
    },
    {
      method: 'DELETE',
      path: '/seat-allocations/:id',
      handler: 'seat-allocation.delete',
    },
    
    // Custom routes
    {
      method: 'GET',
      path: '/seat-allocations/by-bus/:busId',
      handler: 'seat-allocation.findByBus',
    },
    {
      method: 'GET',
      path: '/seat-allocations/by-student/:studentId',
      handler: 'seat-allocation.findByStudent',
    },
    {
      method: 'PUT',
      path: '/seat-allocations/:id/deactivate',
      handler: 'seat-allocation.deactivate',
    }
  ],
};