'use strict';

module.exports = (config, { strapi }) => {
  return async (ctx, next) => {
    // Store original method and URL for logging
    const { method, url } = ctx.request;
    const startTime = Date.now();
    
    await next();
    
    // Log API calls (Observer Pattern)
    if (ctx.state.user && ['POST', 'PUT', 'DELETE'].includes(method)) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      try {
        await strapi.entityService.create('api::api-log.api-log', {
          data: {
            user: ctx.state.user.id,
            method,
            url,
            status_code: ctx.status,
            duration,
            ip_address: ctx.request.ip,
            user_agent: ctx.request.header['user-agent']
          }
        });
      } catch (error) {
        console.error('Failed to log API call:', error);
      }
    }
  };
};