import axios from 'axios';

export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:1337/api';

// Transform function to flatten attributes and handle nested relationships
const transformResponseData = (data) => {
  if (!data) return data;
  
  // Helper function to transform a single item
  const transformItem = (item) => {
    if (!item || !item.attributes) {
      return item;
    }
    
    const transformed = {
      id: item.id,
      ...item.attributes
    };
    
    // Handle nested relationships
    Object.keys(transformed).forEach(key => {
      const value = transformed[key];
      
      // Check if it's a nested relationship with data property
      if (value && typeof value === 'object' && value.data !== undefined) {
        if (Array.isArray(value.data)) {
          // Handle array of related items (like guardians)
          transformed[key] = value.data.map(relatedItem => {
            if (relatedItem.attributes) {
              return {
                id: relatedItem.id,
                ...relatedItem.attributes
              };
            }
            return relatedItem;
          });
        } else if (value.data && value.data.attributes) {
          // Handle single related item
          transformed[key] = {
            id: value.data.id,
            ...value.data.attributes
          };
        } else {
          // Handle null or empty relationships
          transformed[key] = value.data;
        }
      }
    });
    
    return transformed;
  };
  
  // Handle single item with attributes
  if (data.attributes) {
    return transformItem(data);
  }
  
  // Handle array of items
  if (Array.isArray(data)) {
    return data.map(transformItem);
  }
  
  // Handle paginated response structure (Strapi format)
  if (data.data && Array.isArray(data.data)) {
    return {
      ...data,
      data: data.data.map(transformItem)
    };
  }
  
  // Handle single item response structure
  if (data.data && data.data.attributes) {
    return {
      ...data,
      data: transformItem(data.data)
    };
  }
  
  return data;
};

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling AND data transformation
apiClient.interceptors.response.use(
  (response) => {
    // Transform the response data to flatten attributes and relationships
    response.data = transformResponseData(response.data);
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