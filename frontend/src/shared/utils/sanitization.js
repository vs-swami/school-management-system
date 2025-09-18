/**
 * Input sanitization utilities to prevent XSS and ensure data integrity
 * These functions help clean user input before processing or storage
 */

/**
 * Remove HTML tags and potentially dangerous characters from string input
 * @param {string} input - The input string to sanitize
 * @returns {string} - Sanitized string
 */
export const sanitizeString = (input) => {
  if (typeof input !== 'string') return '';

  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/<[^>]*>/g, '') // Remove all HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
};

/**
 * Sanitize and validate email addresses
 * @param {string} email - Email to sanitize
 * @returns {string} - Sanitized email or empty string if invalid
 */
export const sanitizeEmail = (email) => {
  if (typeof email !== 'string') return '';

  const sanitized = sanitizeString(email.toLowerCase());
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailRegex.test(sanitized) ? sanitized : '';
};

/**
 * Sanitize phone numbers - keep only digits, spaces, hyphens, parentheses, and plus
 * @param {string} phone - Phone number to sanitize
 * @returns {string} - Sanitized phone number
 */
export const sanitizePhoneNumber = (phone) => {
  if (typeof phone !== 'string') return '';

  return phone.replace(/[^\d\s\-()+ ]/g, '').trim();
};

/**
 * Sanitize numeric input - ensure it's a valid number
 * @param {any} input - Input to sanitize as number
 * @param {number} defaultValue - Default value if input is invalid
 * @returns {number} - Sanitized number
 */
export const sanitizeNumber = (input, defaultValue = 0) => {
  const num = parseFloat(input);
  return isNaN(num) ? defaultValue : num;
};

/**
 * Sanitize and validate date input
 * @param {any} date - Date input to sanitize
 * @returns {Date|null} - Valid Date object or null if invalid
 */
export const sanitizeDate = (date) => {
  if (!date) return null;

  const dateObj = new Date(date);
  return isNaN(dateObj.getTime()) ? null : dateObj;
};

/**
 * Sanitize file name for safe storage
 * @param {string} fileName - Original file name
 * @returns {string} - Sanitized file name
 */
export const sanitizeFileName = (fileName) => {
  if (typeof fileName !== 'string') return 'unnamed_file';

  return fileName
    .replace(/[^a-zA-Z0-9.\-_ ]/g, '') // Keep only alphanumeric, dots, hyphens, underscores, spaces
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single
    .substring(0, 255); // Limit length
};

/**
 * Deep sanitize an object, applying appropriate sanitization to each field
 * @param {object} obj - Object to sanitize
 * @param {object} fieldTypes - Map of field names to their types for targeted sanitization
 * @returns {object} - Sanitized object
 */
export const sanitizeObject = (obj, fieldTypes = {}) => {
  if (!obj || typeof obj !== 'object') return {};

  const sanitized = {};

  for (const [key, value] of Object.entries(obj)) {
    const fieldType = fieldTypes[key] || 'string';

    switch (fieldType) {
      case 'email':
        sanitized[key] = sanitizeEmail(value);
        break;
      case 'phone':
        sanitized[key] = sanitizePhoneNumber(value);
        break;
      case 'number':
        sanitized[key] = sanitizeNumber(value);
        break;
      case 'date':
        sanitized[key] = sanitizeDate(value);
        break;
      case 'fileName':
        sanitized[key] = sanitizeFileName(value);
        break;
      case 'array':
        sanitized[key] = Array.isArray(value)
          ? value.map(item => typeof item === 'string' ? sanitizeString(item) : item)
          : [];
        break;
      case 'object':
        sanitized[key] = typeof value === 'object' ? sanitizeObject(value) : {};
        break;
      default:
        sanitized[key] = sanitizeString(value);
    }
  }

  return sanitized;
};

/**
 * Validate file upload for security
 * @param {File} file - File to validate
 * @param {object} options - Validation options
 * @returns {object} - Validation result with isValid and errors
 */
export const validateFileUpload = (file, options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'],
    allowedMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/jpg',
      'image/png'
    ]
  } = options;

  const errors = [];

  // Check file size
  if (file.size > maxSize) {
    errors.push(`File size must be less than ${maxSize / (1024 * 1024)}MB`);
  }

  // Check file extension
  const fileExtension = file.name.split('.').pop().toLowerCase();
  if (!allowedTypes.includes(fileExtension)) {
    errors.push(`File type .${fileExtension} is not allowed`);
  }

  // Check MIME type
  if (!allowedMimeTypes.includes(file.type)) {
    errors.push(`File MIME type ${file.type} is not allowed`);
  }

  // Check for potentially dangerous file names
  const dangerousPatterns = [
    /\.exe$/i, /\.bat$/i, /\.cmd$/i, /\.scr$/i, /\.pif$/i,
    /\.jar$/i, /\.js$/i, /\.vbs$/i, /\.php$/i, /\.pl$/i
  ];

  if (dangerousPatterns.some(pattern => pattern.test(file.name))) {
    errors.push('File type is not allowed for security reasons');
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedFileName: sanitizeFileName(file.name)
  };
};

/**
 * Escape HTML entities to prevent XSS when displaying user content
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text safe for HTML display
 */
export const escapeHtml = (text) => {
  if (typeof text !== 'string') return '';

  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

/**
 * Remove extra whitespace and normalize spacing
 * @param {string} text - Text to normalize
 * @returns {string} - Normalized text
 */
export const normalizeWhitespace = (text) => {
  if (typeof text !== 'string') return '';

  return text
    .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
    .trim(); // Remove leading/trailing whitespace
};