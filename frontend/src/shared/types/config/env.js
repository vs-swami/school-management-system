export const config = {
  API_URL: process.env.REACT_APP_API_URL || 'http://localhost:1337/api',
  APP_NAME: process.env.REACT_APP_NAME || 'School Management System',
  VERSION: process.env.REACT_APP_VERSION || '1.0.0',
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Feature flags
  FEATURES: {
    TRANSPORT_MODULE: process.env.REACT_APP_FEATURE_TRANSPORT === 'true',
    HOSTEL_MODULE: process.env.REACT_APP_FEATURE_HOSTEL === 'true',
    REPORTS_MODULE: process.env.REACT_APP_FEATURE_REPORTS === 'true',
  },
  
  // Pagination defaults
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  
  // File upload limits
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: ['pdf', 'jpg', 'jpeg', 'png'],
};