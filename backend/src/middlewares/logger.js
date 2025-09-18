/**
 * Structured logging middleware and utilities
 * Provides consistent logging across the application with proper levels and context
 */

const winston = require('winston');
const { format, transports } = winston;

/**
 * Create logger instance with proper configuration
 */
const createLogger = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const logLevel = process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info');

  // Custom format for consistent log structure
  const logFormat = format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.json(),
    format.printf(({ timestamp, level, message, ...meta }) => {
      const logObject = {
        timestamp,
        level: level.toUpperCase(),
        message,
        ...meta
      };

      // In development, make logs more readable
      if (isDevelopment) {
        return JSON.stringify(logObject, null, 2);
      }

      return JSON.stringify(logObject);
    })
  );

  const logTransports = [
    // Console transport for all environments
    new transports.Console({
      level: logLevel,
      format: isDevelopment
        ? format.combine(format.colorize(), logFormat)
        : logFormat,
    }),
  ];

  // Add file transports for production
  if (!isDevelopment) {
    logTransports.push(
      // Error logs
      new transports.File({
        filename: 'logs/error.log',
        level: 'error',
        format: logFormat,
        maxsize: 10 * 1024 * 1024, // 10MB
        maxFiles: 5,
      }),
      // Combined logs
      new transports.File({
        filename: 'logs/combined.log',
        format: logFormat,
        maxsize: 10 * 1024 * 1024, // 10MB
        maxFiles: 10,
      })
    );
  }

  return winston.createLogger({
    level: logLevel,
    format: logFormat,
    transports: logTransports,
    // Don't exit on handled exceptions
    exitOnError: false,
  });
};

// Initialize logger
const logger = createLogger();

/**
 * Request logging middleware
 * Logs incoming requests with timing and response status
 */
const requestLogger = () => {
  return async (ctx, next) => {
    const startTime = Date.now();

    // Extract relevant request information
    const requestInfo = {
      method: ctx.request.method,
      url: ctx.request.url,
      userAgent: ctx.request.headers['user-agent'],
      ip: ctx.request.ip || ctx.request.socket.remoteAddress,
      referer: ctx.request.headers.referer,
      contentType: ctx.request.headers['content-type'],
    };

    // Add user info if authenticated
    if (ctx.state.user) {
      requestInfo.userId = ctx.state.user.id;
      requestInfo.userEmail = ctx.state.user.email;
    }

    logger.info('Incoming request', requestInfo);

    try {
      await next();

      // Calculate response time
      const responseTime = Date.now() - startTime;

      // Log successful response
      logger.info('Request completed', {
        ...requestInfo,
        status: ctx.status,
        responseTime: `${responseTime}ms`,
        contentLength: ctx.response.length,
      });

    } catch (error) {
      // Calculate response time for errors
      const responseTime = Date.now() - startTime;

      // Log error response
      logger.error('Request failed', {
        ...requestInfo,
        status: error.status || 500,
        responseTime: `${responseTime}ms`,
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name,
        },
      });

      // Re-throw to let Strapi handle the error
      throw error;
    }
  };
};

/**
 * Error logging middleware
 * Catches and logs unhandled errors with context
 */
const errorLogger = () => {
  return async (ctx, next) => {
    try {
      await next();
    } catch (error) {
      // Determine error category
      const errorCategory = getErrorCategory(error);

      // Extract user context
      const userContext = ctx.state.user ? {
        userId: ctx.state.user.id,
        userEmail: ctx.state.user.email,
      } : { userId: null };

      // Log error with full context
      logger.error('Application error', {
        category: errorCategory,
        error: {
          message: error.message,
          name: error.name,
          status: error.status || 500,
          stack: error.stack,
        },
        request: {
          method: ctx.request.method,
          url: ctx.request.url,
          ip: ctx.request.ip || ctx.request.socket.remoteAddress,
          userAgent: ctx.request.headers['user-agent'],
        },
        user: userContext,
        timestamp: new Date().toISOString(),
      });

      // Re-throw to let Strapi handle the response
      throw error;
    }
  };
};

/**
 * Categorize errors for better monitoring and alerting
 * @param {Error} error - The error object
 * @returns {string} - Error category
 */
const getErrorCategory = (error) => {
  if (error.status) {
    if (error.status >= 400 && error.status < 500) {
      return 'CLIENT_ERROR';
    }
    if (error.status >= 500) {
      return 'SERVER_ERROR';
    }
  }

  if (error.name === 'ValidationError') return 'VALIDATION_ERROR';
  if (error.name === 'CastError') return 'DATABASE_ERROR';
  if (error.name === 'MongoError') return 'DATABASE_ERROR';
  if (error.name === 'SequelizeError') return 'DATABASE_ERROR';
  if (error.message?.includes('ECONNREFUSED')) return 'CONNECTION_ERROR';
  if (error.message?.includes('timeout')) return 'TIMEOUT_ERROR';

  return 'UNKNOWN_ERROR';
};

/**
 * Audit logging for sensitive operations
 * @param {string} action - The action being performed
 * @param {object} context - Additional context
 * @param {object} user - User performing the action
 */
const auditLog = (action, context = {}, user = null) => {
  logger.info('Audit log', {
    type: 'AUDIT',
    action,
    user: user ? {
      id: user.id,
      email: user.email,
    } : null,
    context,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Performance logging for slow operations
 * @param {string} operation - The operation name
 * @param {number} duration - Duration in milliseconds
 * @param {object} context - Additional context
 */
const performanceLog = (operation, duration, context = {}) => {
  const level = duration > 5000 ? 'warn' : 'info'; // Warn if > 5 seconds

  logger[level]('Performance metric', {
    type: 'PERFORMANCE',
    operation,
    duration: `${duration}ms`,
    context,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Security event logging
 * @param {string} event - Security event type
 * @param {object} details - Event details
 * @param {object} request - Request context
 */
const securityLog = (event, details = {}, request = {}) => {
  logger.warn('Security event', {
    type: 'SECURITY',
    event,
    details,
    request: {
      ip: request.ip,
      userAgent: request.userAgent,
      url: request.url,
      method: request.method,
    },
    timestamp: new Date().toISOString(),
  });
};

// Override console.log to use structured logging in production
if (process.env.NODE_ENV === 'production') {
  const originalLog = console.log;
  console.log = (...args) => {
    if (args.length === 1 && typeof args[0] === 'string') {
      logger.info(args[0]);
    } else {
      logger.info('Console log', { data: args });
    }
  };

  console.error = (...args) => {
    if (args.length === 1 && typeof args[0] === 'string') {
      logger.error(args[0]);
    } else {
      logger.error('Console error', { data: args });
    }
  };
}

module.exports = {
  logger,
  requestLogger,
  errorLogger,
  auditLog,
  performanceLog,
  securityLog,
};