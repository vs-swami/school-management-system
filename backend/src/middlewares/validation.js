/**
 * Input validation and sanitization middleware
 * Provides centralized validation for API requests using Joi schema validation
 */

const Joi = require('joi');
const validator = require('validator');

/**
 * Sanitize string input to prevent XSS attacks
 * @param {string} input - Raw input string
 * @returns {string} - Sanitized string
 */
const sanitizeString = (input) => {
  if (typeof input !== 'string') return input;

  return validator.escape(input.trim());
};

/**
 * Deep sanitize object recursively
 * @param {object} obj - Object to sanitize
 * @returns {object} - Sanitized object
 */
const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;

  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item =>
        typeof item === 'string' ? sanitizeString(item) :
        typeof item === 'object' ? sanitizeObject(item) : item
      );
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
};

/**
 * Student validation schema
 */
const studentSchema = Joi.object({
  gr_full_name: Joi.string().min(2).max(100).required()
    .pattern(/^[a-zA-Z\s]+$/)
    .messages({
      'string.pattern.base': 'Full name can only contain letters and spaces'
    }),

  first_name: Joi.string().min(1).max(50).required()
    .pattern(/^[a-zA-Z]+$/)
    .messages({
      'string.pattern.base': 'First name can only contain letters'
    }),

  middle_name: Joi.string().max(50).allow('', null)
    .pattern(/^[a-zA-Z]*$/)
    .messages({
      'string.pattern.base': 'Middle name can only contain letters'
    }),

  last_name: Joi.string().min(1).max(50).required()
    .pattern(/^[a-zA-Z]+$/)
    .messages({
      'string.pattern.base': 'Last name can only contain letters'
    }),

  gender: Joi.string().valid('Male', 'Female', 'Other').required(),

  dob: Joi.date().max('now').required()
    .messages({
      'date.max': 'Date of birth cannot be in the future'
    }),

  aadhar_no: Joi.string().pattern(/^\d{12}$/).allow('', null)
    .messages({
      'string.pattern.base': 'Aadhar number must be exactly 12 digits'
    }),

  // Guardian validation
  guardians: Joi.array().items(
    Joi.object({
      full_name: Joi.string().min(2).max(100).required()
        .pattern(/^[a-zA-Z\s]+$/),
      relation: Joi.string().valid('Father', 'Mother', 'Guardian', 'Other').required(),
      mobile: Joi.string().pattern(/^[+]?[\d\s\-()]{10,15}$/).required()
        .messages({
          'string.pattern.base': 'Invalid mobile number format'
        }),
      occupation: Joi.string().max(100).allow('', null),
      primary_contact: Joi.boolean().default(false)
    })
  ).min(1).required(),

  // Enrollment validation
  enrollments: Joi.array().items(
    Joi.object({
      academic_year: Joi.number().integer().min(1).required(),
      class: Joi.number().integer().min(1).required(),
      gr_no: Joi.string().max(20).allow('', null),
      admission_type: Joi.string().valid('Fresh', 'Transfer').required(),
      enrollment_status: Joi.string().valid('Enquiry', 'Admitted', 'Rejected', 'Graduated').default('Enquiry'),
      date_enrolled: Joi.date().max('now'),
      lc_received: Joi.boolean().default(false),

      // Administration (optional)
      administration: Joi.object({
        division: Joi.number().integer().min(1).allow('', null),
        seat_allocations: Joi.array().items(
          Joi.object({
            pickup_stop: Joi.number().integer().min(1).allow('', null)
          })
        ).max(1)
      }).allow(null)
    })
  ).max(1)
});

/**
 * Guardian validation schema
 */
const guardianSchema = Joi.object({
  full_name: Joi.string().min(2).max(100).required()
    .pattern(/^[a-zA-Z\s]+$/),
  relation: Joi.string().valid('Father', 'Mother', 'Guardian', 'Other').required(),
  mobile: Joi.string().pattern(/^[+]?[\d\s\-()]{10,15}$/).required(),
  occupation: Joi.string().max(100).allow('', null),
  primary_contact: Joi.boolean().default(false),
  students: Joi.array().items(Joi.number().integer().min(1))
});

/**
 * Enrollment validation schema
 */
const enrollmentSchema = Joi.object({
  academic_year: Joi.number().integer().min(1).required(),
  class: Joi.number().integer().min(1).required(),
  gr_no: Joi.string().max(20).allow('', null),
  admission_type: Joi.string().valid('Fresh', 'Transfer').required(),
  enrollment_status: Joi.string().valid('Enquiry', 'Admitted', 'Rejected', 'Graduated').default('Enquiry'),
  date_enrolled: Joi.date().max('now'),
  lc_received: Joi.boolean().default(false),
  student: Joi.number().integer().min(1).required()
});

/**
 * Validation middleware factory
 * @param {Joi.Schema} schema - Joi validation schema
 * @param {string} property - Request property to validate ('body', 'params', 'query')
 * @returns {Function} - Validation middleware function
 */
const validate = (schema, property = 'body') => {
  return async (ctx, next) => {
    try {
      // Sanitize input data
      const dataToValidate = sanitizeObject(ctx.request[property]);

      // Validate against schema
      const { error, value } = schema.validate(dataToValidate, {
        abortEarly: false, // Return all errors
        stripUnknown: true, // Remove unknown fields
        convert: true // Convert types when possible
      });

      if (error) {
        const validationErrors = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
          value: detail.context?.value
        }));

        strapi.log.warn('Validation failed', {
          endpoint: ctx.request.url,
          method: ctx.request.method,
          errors: validationErrors,
          userAgent: ctx.request.headers['user-agent']
        });

        return ctx.badRequest('Validation failed', {
          errors: validationErrors
        });
      }

      // Replace original data with validated and sanitized data
      ctx.request[property] = value;

      await next();
    } catch (err) {
      strapi.log.error('Validation middleware error', {
        error: err.message,
        stack: err.stack,
        endpoint: ctx.request.url
      });

      return ctx.internalServerError('Validation error occurred');
    }
  };
};

/**
 * Rate limiting middleware
 */
const rateLimit = () => {
  const requestCounts = new Map();
  const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
  const MAX_REQUESTS = 100; // requests per window

  return async (ctx, next) => {
    const clientIp = ctx.request.ip || ctx.request.socket.remoteAddress;
    const now = Date.now();
    const windowStart = now - WINDOW_MS;

    // Clean old entries
    for (const [ip, data] of requestCounts.entries()) {
      if (data.windowStart < windowStart) {
        requestCounts.delete(ip);
      }
    }

    // Get or create client data
    let clientData = requestCounts.get(clientIp);
    if (!clientData || clientData.windowStart < windowStart) {
      clientData = {
        count: 0,
        windowStart: now
      };
      requestCounts.set(clientIp, clientData);
    }

    // Check rate limit
    if (clientData.count >= MAX_REQUESTS) {
      strapi.log.warn('Rate limit exceeded', {
        ip: clientIp,
        count: clientData.count,
        endpoint: ctx.request.url
      });

      return ctx.tooManyRequests('Rate limit exceeded. Try again later.', {
        retryAfter: Math.ceil(WINDOW_MS / 1000)
      });
    }

    // Increment counter
    clientData.count++;

    await next();
  };
};

module.exports = {
  validate,
  sanitizeString,
  sanitizeObject,
  rateLimit,
  schemas: {
    student: studentSchema,
    guardian: guardianSchema,
    enrollment: enrollmentSchema
  }
};