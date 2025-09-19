module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/divisions/metrics',
      handler: 'division.getMetrics',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/divisions/metrics/:divisionId',
      handler: 'division.getMetrics',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/divisions/year-groups/comparison',
      handler: 'division.getYearGroupComparison',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
};