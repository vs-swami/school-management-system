import axios from 'axios';
import qs from 'qs';

export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:1337/api';

// Strapi 5 no longer needs response transformation
// Data is already flat without .attributes wrapper
// Each repository handles its own specific transformations

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  paramsSerializer: (params) => {
    return qs.stringify(params, { encodeValuesOnly: true });
  },
});

// Request interceptor for auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Only set Content-Type to application/json if the data is NOT FormData
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }
    // For FormData, Axios will automatically set 'multipart/form-data' with boundary
    // No need to explicitly delete config.headers['Content-Type'] here anymore

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling only
apiClient.interceptors.response.use(
  (response) => {
    // Strapi 5 responses don't need transformation
    // Each repository handles its own specific data formatting
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);