/**
 * Bootstrap file for Strapi application
 */

const createTestUsers = require('./seed/create-test-users');

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to register additional models,
   * modify the Strapi configuration, add new routes, etc.
   */
  register(/*{ strapi }*/) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }) {
    console.log('🚀 Strapi is bootstrapping...');

    // Only create test users in development mode
    if (process.env.NODE_ENV === 'development') {
      // Check if we should seed test users (controlled by environment variable)
      if (process.env.SEED_TEST_USERS === 'true') {
        try {
          await createTestUsers(strapi);
        } catch (error) {
          console.error('Failed to create test users:', error);
        }
      }
    }

    console.log('✅ Bootstrap complete');
  },
};