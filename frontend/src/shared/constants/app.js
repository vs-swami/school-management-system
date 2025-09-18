/**
 * Application-wide constants and configuration
 * Centralizes magic numbers and strings for better maintainability
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:1337',
  ENDPOINTS: {
    AUTH: '/api/auth/local',
    STUDENTS: '/api/students',
    CLASSES: '/api/classes',
    ACADEMIC_YEARS: '/api/academic-years',
    BUS_STOPS: '/api/bus-stops',
    BUS_ROUTES: '/api/bus-routes',
    DOCUMENTS: '/api/student-documents',
    UPLOAD: '/api/upload'
  },
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000 // 1 second
};

// Form Constants
export const FORM_CONFIG = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_FILE_TYPES: {
    DOCUMENTS: ['pdf', 'doc', 'docx'],
    IMAGES: ['jpg', 'jpeg', 'png'],
    ALL: ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png']
  },
  VALIDATION: {
    MIN_PASSWORD_LENGTH: 8,
    MAX_NAME_LENGTH: 100,
    MAX_DESCRIPTION_LENGTH: 500,
    PHONE_REGEX: /^[+]?[\d\s\-()]{10,15}$/,
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  }
};

// Student Management Constants
export const STUDENT_CONFIG = {
  STEPS: {
    COMBINED_INFO: 0,
    DOCUMENTS: 1,
    EXAM_RESULTS: 2,
    ADMINISTRATION: 3,
    SUMMARY: 4
  },
  STEP_NAMES: ['Student Info', 'Documents', 'Exam Results', 'Administration', 'Summary'],
  ENROLLMENT_STATUS: {
    ENQUIRY: 'Enquiry',
    ADMITTED: 'Admitted',
    REJECTED: 'Rejected',
    GRADUATED: 'Graduated'
  },
  ADMISSION_TYPES: {
    FRESH: 'Fresh',
    TRANSFER: 'Transfer'
  },
  GENDERS: {
    MALE: 'Male',
    FEMALE: 'Female',
    OTHER: 'Other'
  }
};

// Document Types (must match backend schema)
export const DOCUMENT_TYPES = {
  BIRTH_CERTIFICATE: 'Birth Certificate',
  PREVIOUS_SCHOOL_LC: 'Previous School LC',
  AADHAR_CARD: 'Aadhar Card',
  PASSPORT_PHOTO: 'Passport Photo',
  CASTE_CERTIFICATE: 'Caste Certificate',
  INCOME_CERTIFICATE: 'Income Certificate',
  MEDICAL_CERTIFICATE: 'Medical Certificate',
  OTHER: 'Other'
};

// UI Constants
export const UI_CONFIG = {
  DEBOUNCE_DELAY: 300, // milliseconds
  ANIMATION_DURATION: 200,
  TOAST_DURATION: 5000,
  LOADING_SPINNER_DELAY: 200, // Show spinner after 200ms to avoid flashing
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 20,
    PAGE_SIZE_OPTIONS: [10, 20, 50, 100]
  },
  BREAKPOINTS: {
    SM: '640px',
    MD: '768px',
    LG: '1024px',
    XL: '1280px'
  }
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please correct the highlighted errors before proceeding.',
  UPLOAD_ERROR: 'File upload failed. Please try again.',
  AUTHENTICATION_ERROR: 'Authentication failed. Please login again.',
  PERMISSION_ERROR: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',
  FILE_SIZE_ERROR: `File size must be less than ${FORM_CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB`,
  FILE_TYPE_ERROR: 'Invalid file type. Please select a supported file format.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  STUDENT_CREATED: 'Student created successfully!',
  STUDENT_UPDATED: 'Student updated successfully!',
  STUDENT_DELETED: 'Student deleted successfully!',
  DOCUMENT_UPLOADED: 'Document uploaded successfully!',
  DOCUMENT_DELETED: 'Document deleted successfully!',
  SETTINGS_SAVED: 'Settings saved successfully!'
};

// Route Paths
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  STUDENTS: '/students',
  STUDENT_CREATE: '/students/create',
  STUDENT_EDIT: '/students/:id/edit',
  STUDENT_VIEW: '/students/:id',
  CLASSES: '/classes',
  REPORTS: '/reports',
  SETTINGS: '/settings'
};

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_PREFERENCES: 'user_preferences',
  FORM_DRAFT: 'form_draft_',
  THEME: 'theme'
};

// Feature Flags (for gradual rollout of new features)
export const FEATURE_FLAGS = {
  ENABLE_ADVANCED_SEARCH: true,
  ENABLE_BULK_OPERATIONS: false,
  ENABLE_DARK_MODE: false,
  ENABLE_NOTIFICATIONS: true
};

// Environment-specific configurations
export const ENV_CONFIG = {
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_TEST: process.env.NODE_ENV === 'test',
  LOG_LEVEL: process.env.REACT_APP_LOG_LEVEL || 'info',
  ENABLE_REDUX_DEVTOOLS: process.env.REACT_APP_ENABLE_REDUX_DEVTOOLS === 'true'
};