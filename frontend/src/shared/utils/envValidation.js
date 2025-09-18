/**
 * Environment variable validation to ensure required configurations are present
 * Prevents runtime errors due to missing environment variables
 */

/**
 * Validate required environment variables
 * @param {object} requiredVars - Map of variable names to their validation rules
 * @returns {object} - Validation result with isValid and errors
 */
export const validateEnvironment = (requiredVars = {}) => {
  const errors = [];
  const warnings = [];

  // Default required variables for the application
  const defaultRequiredVars = {
    NODE_ENV: {
      required: true,
      allowedValues: ['development', 'production', 'test'],
      description: 'Application environment'
    },
    REACT_APP_API_URL: {
      required: true,
      type: 'url',
      description: 'Backend API URL'
    },
    REACT_APP_APP_NAME: {
      required: false,
      defaultValue: 'School Management System',
      description: 'Application name'
    }
  };

  const varsToValidate = { ...defaultRequiredVars, ...requiredVars };

  for (const [varName, rules] of Object.entries(varsToValidate)) {
    const value = process.env[varName];

    // Check if required variable is missing
    if (rules.required && (!value || value.trim() === '')) {
      errors.push(`Missing required environment variable: ${varName} - ${rules.description}`);
      continue;
    }

    // Skip validation if variable is optional and not provided
    if (!rules.required && (!value || value.trim() === '')) {
      if (rules.defaultValue) {
        warnings.push(`Using default value for ${varName}: ${rules.defaultValue}`);
      }
      continue;
    }

    // Validate type if specified
    if (rules.type && value) {
      switch (rules.type) {
        case 'url':
          try {
            new URL(value);
          } catch {
            errors.push(`${varName} must be a valid URL`);
          }
          break;

        case 'number':
          if (isNaN(Number(value))) {
            errors.push(`${varName} must be a valid number`);
          }
          break;

        case 'boolean':
          if (!['true', 'false', '1', '0'].includes(value.toLowerCase())) {
            errors.push(`${varName} must be a boolean value (true/false)`);
          }
          break;

        case 'email':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            errors.push(`${varName} must be a valid email address`);
          }
          break;
      }
    }

    // Validate allowed values if specified
    if (rules.allowedValues && value) {
      if (!rules.allowedValues.includes(value)) {
        errors.push(`${varName} must be one of: ${rules.allowedValues.join(', ')}`);
      }
    }

    // Validate min/max length if specified
    if (rules.minLength && value && value.length < rules.minLength) {
      errors.push(`${varName} must be at least ${rules.minLength} characters long`);
    }

    if (rules.maxLength && value && value.length > rules.maxLength) {
      errors.push(`${varName} must not exceed ${rules.maxLength} characters`);
    }

    // Validate regex pattern if specified
    if (rules.pattern && value && !rules.pattern.test(value)) {
      errors.push(`${varName} does not match the required pattern`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Get environment-specific configuration
 * @returns {object} - Environment configuration
 */
export const getEnvironmentConfig = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isProduction = process.env.NODE_ENV === 'production';
  const isTest = process.env.NODE_ENV === 'test';

  return {
    environment: process.env.NODE_ENV,
    isDevelopment,
    isProduction,
    isTest,
    apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:1337',
    appName: process.env.REACT_APP_APP_NAME || 'School Management System',
    logLevel: process.env.REACT_APP_LOG_LEVEL || (isDevelopment ? 'debug' : 'error'),
    enableDevTools: isDevelopment && process.env.REACT_APP_ENABLE_DEV_TOOLS !== 'false',
    version: process.env.REACT_APP_VERSION || 'dev'
  };
};

/**
 * Initialize environment validation on app startup
 * Throws error if critical environment variables are missing
 */
export const initializeEnvironment = () => {
  const validation = validateEnvironment();

  // Log warnings to console
  if (validation.warnings.length > 0) {
    console.warn('Environment warnings:', validation.warnings);
  }

  // Throw error for critical environment issues
  if (!validation.isValid) {
    const errorMessage = `Environment validation failed:\n${validation.errors.join('\n')}`;
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  console.log('Environment validation passed successfully');
  return getEnvironmentConfig();
};

/**
 * Check if we're running in a secure context (HTTPS in production)
 * @returns {boolean} - Whether the context is secure
 */
export const isSecureContext = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const isHttps = window.location.protocol === 'https:';
  const isLocalhost = window.location.hostname === 'localhost' ||
                      window.location.hostname === '127.0.0.1';

  // In production, require HTTPS unless it's localhost
  if (isProduction && !isHttps && !isLocalhost) {
    console.warn('Application is running in production without HTTPS');
    return false;
  }

  return true;
};