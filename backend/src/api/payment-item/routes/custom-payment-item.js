'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/payment-items/schedule/:scheduleId',
      handler: 'payment-item.getBySchedule',
      config: {
        policies: [],
        middlewares: []
      }
    },
    {
      method: 'PUT',
      path: '/payment-items/:id/status',
      handler: 'payment-item.updatePaymentStatus',
      config: {
        policies: [],
        middlewares: []
      }
    }
  ]
};