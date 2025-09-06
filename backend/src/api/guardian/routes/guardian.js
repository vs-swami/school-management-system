module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/guardians',
      handler: 'guardian.create',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/guardians',
      handler: 'guardian.find',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/guardians/:id',
      handler: 'guardian.findOne',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/guardians/:id',
      handler: 'guardian.update',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'DELETE',
      path: '/guardians/:id',
      handler: 'guardian.delete',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
