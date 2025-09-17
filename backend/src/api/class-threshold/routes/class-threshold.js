'use strict';

/**
 * class-threshold router
 */
module.exports = {
  routes: [
    // Your existing routes...
    {
      method: 'GET',
      path: '/class-thresholds',
      handler: 'class-threshold.find',
    },
    {
      method: 'GET',
      path: '/class-thresholds/:id',
      handler: 'class-threshold.findOne',
    },
    {
      method: 'POST',
      path: '/class-thresholds',
      handler: 'class-threshold.create',
    },
    {
      method: 'PUT',
      path: '/class-thresholds/:id',
      handler: 'class-threshold.update',
    },
    {
      method: 'DELETE',
      path: '/class-thresholds/:id',
      handler: 'class-threshold.delete',
    },
    {
      method: 'GET',
      path: '/class-thresholds/class/:classId',
      handler: 'class-threshold.findByClass',
    },
    {
      method: 'GET',
      path: '/class-thresholds/capacity-summary',
      handler: 'class-threshold.getCapacitySummary',
    },
    {
      method: 'POST',
      path: '/class-thresholds/bulk-create',
      handler: 'class-threshold.bulkCreate',
    },

    // ADD THESE NEW ROUTES for service methods:
    {
      method: 'GET',
      path: '/class-thresholds/capacity/:classId/:divisionId',
      handler: 'class-threshold.getAvailableCapacity',
    },
    {
      method: 'GET',
      path: '/class-thresholds/utilization/:classId',
      handler: 'class-threshold.getClassUtilization',
    },
    {
      method: 'GET',
      path: '/class-thresholds/best-division/:classId',
      handler: 'class-threshold.findBestDivision',
    },
    
  ],
};