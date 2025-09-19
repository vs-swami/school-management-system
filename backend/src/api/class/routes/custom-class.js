module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/classes/metrics',
      handler: 'class.getMetrics',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/classes/metrics/:classId',
      handler: 'class.getMetrics',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/classes/summary',
      handler: 'class.getSummaryStats',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/classes/:id/stats',
      handler: 'class.findWithStats',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/classes/all/summary',
      handler: 'class.findAllWithSummary',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
};