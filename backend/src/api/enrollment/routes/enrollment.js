const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::enrollment.enrollment', {
  prefix: '',
  only: ['find', 'findOne', 'create', 'update', 'delete'], // Include all default CRUD operations
  except: [],
  config: {
    find: {
      policies: [], // Can add authentication policies later
      middlewares: [],
    },
    findOne: {
      policies: [],
      middlewares: [],
    },
    create: {
      policies: [],
      middlewares: [],
    },
    update: {
      policies: [],
      middlewares: [],
    },
    delete: {
      policies: [],
      middlewares: [],
    },
  },
  routes: [
    // Custom route for updating enrollment status only
    {
      method: 'PUT',
      path: '/enrollments/:id/enrollment_status',
      handler: 'enrollment.updateStatus',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
});
