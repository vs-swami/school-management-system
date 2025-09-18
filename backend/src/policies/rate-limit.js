/**
 * Rate limiting policy
 * Prevents abuse by limiting requests per IP address
 */

const { securityLog } = require('../middlewares/logger');

// In-memory store for rate limiting (use Redis in production)
const requestCounts = new Map();

// Configuration
const RATE_LIMIT_CONFIG = {
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // requests per window
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
};

/**
 * Clean expired entries from rate limit store
 */
const cleanExpiredEntries = () => {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_CONFIG.windowMs;

  for (const [key, data] of requestCounts.entries()) {
    if (data.resetTime < now) {
      requestCounts.delete(key);
    }
  }
};

module.exports = async (policyContext, config = {}, { strapi }) => {
  const { ctx } = policyContext;

  // Merge config with defaults
  const rateLimitConfig = { ...RATE_LIMIT_CONFIG, ...config };

  // Get client identifier (IP + User ID if authenticated)
  const clientIp = ctx.request.ip || ctx.request.socket.remoteAddress;
  const userId = ctx.state.user?.id || 'anonymous';
  const clientKey = `${clientIp}:${userId}`;

  const now = Date.now();
  const windowStart = now - rateLimitConfig.windowMs;

  // Clean expired entries periodically
  if (Math.random() < 0.01) { // 1% chance to clean on each request
    cleanExpiredEntries();
  }

  // Get or create client data
  let clientData = requestCounts.get(clientKey);
  if (!clientData || clientData.resetTime < now) {
    clientData = {
      count: 0,
      resetTime: now + rateLimitConfig.windowMs,
      firstRequestTime: now,
    };
    requestCounts.set(clientKey, clientData);
  }

  // Check rate limit
  if (clientData.count >= rateLimitConfig.maxRequests) {
    const timeRemaining = Math.ceil((clientData.resetTime - now) / 1000);

    // Log rate limit violation
    securityLog('RATE_LIMIT_EXCEEDED', {
      clientKey,
      count: clientData.count,
      limit: rateLimitConfig.maxRequests,
      windowMs: rateLimitConfig.windowMs,
      timeRemaining: `${timeRemaining}s`,
      endpoint: ctx.request.url,
      method: ctx.request.method,
    }, {
      ip: clientIp,
      userAgent: ctx.request.headers['user-agent'],
      url: ctx.request.url,
      method: ctx.request.method,
    });

    // Set rate limit headers
    ctx.set({
      'X-RateLimit-Limit': rateLimitConfig.maxRequests.toString(),
      'X-RateLimit-Remaining': '0',
      'X-RateLimit-Reset': Math.ceil(clientData.resetTime / 1000).toString(),
      'Retry-After': timeRemaining.toString(),
    });

    return ctx.tooManyRequests('Rate limit exceeded', {
      error: 'Too many requests',
      limit: rateLimitConfig.maxRequests,
      windowMs: rateLimitConfig.windowMs,
      retryAfter: timeRemaining,
    });
  }

  // Increment counter
  clientData.count++;

  // Set rate limit headers
  const remaining = Math.max(0, rateLimitConfig.maxRequests - clientData.count);
  ctx.set({
    'X-RateLimit-Limit': rateLimitConfig.maxRequests.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(clientData.resetTime / 1000).toString(),
  });

  return true;
};