const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::student.student', {
  prefix: '',
  only: ['find', 'findOne', 'create', 'update', 'delete'], // Include all default CRUD operations
  except: [],
  config: {
    find: {
      policies: [], // Temporarily disabled: ['global::is-authenticated', 'global::rate-limit'],
      middlewares: [],
    },
    findOne: {
      policies: [], // Temporarily disabled: ['global::is-authenticated', 'global::rate-limit'],
      middlewares: [],
    },
    create: {
      policies: [], // Temporarily disabled: ['global::is-authenticated', 'global::rate-limit'],
      middlewares: [],
    },
    update: {
      policies: [], // Temporarily disabled: ['global::is-authenticated', 'global::rate-limit'],
      middlewares: [],
    },
    delete: {
      policies: [], // Temporarily disabled: ['global::is-admin', 'global::rate-limit'],
      middlewares: [],
    },
  },
});
