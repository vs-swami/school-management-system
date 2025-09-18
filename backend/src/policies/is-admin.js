/**
 * Admin authorization policy
 * Ensures user has admin role before accessing admin-only resources
 */

const { securityLog, auditLog } = require('../middlewares/logger');

module.exports = async (policyContext, config, { strapi }) => {
  const { ctx } = policyContext;

  // Check if user is authenticated first
  if (!ctx.state.user) {
    securityLog('ADMIN_ACCESS_UNAUTHENTICATED', {
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

  const { user } = ctx.state;

  // Check if user has admin role
  const isAdmin = user.role && (
    user.role.name === 'Administrator' ||
    user.role.type === 'admin' ||
    user.role.code === 'strapi-admin'
  );

  if (!isAdmin) {
    // Log unauthorized admin access attempt
    securityLog('ADMIN_ACCESS_DENIED', {
      userId: user.id,
      userEmail: user.email,
      userRole: user.role?.name || 'unknown',
      endpoint: ctx.request.url,
      method: ctx.request.method,
    }, {
      ip: ctx.request.ip,
      userAgent: ctx.request.headers['user-agent'],
      url: ctx.request.url,
      method: ctx.request.method,
    });

    return ctx.forbidden('Admin access required');
  }

  // Log admin access for auditing
  auditLog('ADMIN_ACCESS', {
    endpoint: ctx.request.url,
    method: ctx.request.method,
    action: getActionFromMethod(ctx.request.method, ctx.request.url),
  }, user);

  return true;
};

/**
 * Extract action type from HTTP method and URL
 * @param {string} method - HTTP method
 * @param {string} url - Request URL
 * @returns {string} - Action type
 */
const getActionFromMethod = (method, url) => {
  switch (method.toUpperCase()) {
    case 'GET':
      return url.includes('/') && url.split('/').pop().match(/^\d+$/) ? 'READ_ONE' : 'READ_MANY';
    case 'POST':
      return 'CREATE';
    case 'PUT':
    case 'PATCH':
      return 'UPDATE';
    case 'DELETE':
      return 'DELETE';
    default:
      return 'UNKNOWN';
  }
};