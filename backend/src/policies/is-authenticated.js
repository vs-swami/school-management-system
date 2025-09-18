/**
 * Authentication policy
 * Ensures user is authenticated before accessing protected resources
 */

const { securityLog } = require('../middlewares/logger');

module.exports = async (policyContext, config, { strapi }) => {
  const { ctx } = policyContext;

  // Check if user is authenticated
  if (!ctx.state.user) {
    // Log security event
    securityLog('AUTHENTICATION_REQUIRED', {
      endpoint: ctx.request.url,
      method: ctx.request.method,
    }, {
      ip: ctx.request.ip,
      userAgent: ctx.request.headers['user-agent'],
      url: ctx.request.url,
      method: ctx.request.method,
    });

    return ctx.unauthorized('Authentication required');
  }

  // User is authenticated, continue
  return true;
};