import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Auth store for managing authentication state
export const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      isAuthenticated: false,
      user: null,
      token: null,
      loading: false,
      error: null,

      // Actions
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      // Initialize authentication on app start
      initializeAuth: async () => {
        const { setLoading, setError } = get();
        
        try {
          setLoading(true);
          setError(null);

          // Check if we have stored auth data
          const token = localStorage.getItem('authToken');
          const userData = localStorage.getItem('userData');

          console.log('Initializing auth with stored data:', { 
            hasToken: !!token, 
            hasUserData: !!userData 
          });

          if (token && userData) {
            // Verify token is still valid with Strapi
            const isValid = await get().verifyToken(token);
            
            if (isValid) {
              set({
                isAuthenticated: true,
                token: token,
                user: JSON.parse(userData)
              });
              console.log('Auth initialized successfully with stored token');
            } else {
              console.log('Stored token is invalid, clearing auth data');
              get().logout();
            }
          } else {
            // No stored auth data
            console.log('No stored auth data found');
            set({ isAuthenticated: false });
          }
        } catch (error) {
          console.error('Auth initialization error:', error);
          setError('Failed to initialize authentication');
          get().logout();
        } finally {
          setLoading(false);
        }
      },

      // Login with email and password
      login: async (email, password) => {
        const { setLoading, setError } = get();
        
        try {
          setLoading(true);
          setError(null);

          const apiUrl = process.env.REACT_APP_STRAPI_URL || 'http://localhost:1337';
          const loginPayload = {
            identifier: email,
            password: password
          };

          console.log('Attempting login to:', `${apiUrl}/api/auth/local`);
          console.log('Login payload:', { identifier: email, password: '[HIDDEN]' });

          const response = await fetch(`${apiUrl}/api/auth/local`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginPayload)
          });

          console.log('Login response status:', response.status);
          console.log('Login response headers:', Object.fromEntries(response.headers.entries()));

          if (!response.ok) {
            const errorData = await response.json();
            console.error('Login error response:', errorData);
            
            // Handle specific Strapi error messages
            let errorMessage = 'Login failed';
            if (errorData.error) {
              if (errorData.error.message) {
                errorMessage = errorData.error.message;
              } else if (typeof errorData.error === 'string') {
                errorMessage = errorData.error;
              }
            } else if (errorData.message) {
              errorMessage = errorData.message;
            }
            
            throw new Error(errorMessage);
          }

          const data = await response.json();
          console.log('Login successful, received data:', {
            hasJwt: !!data.jwt,
            hasUser: !!data.user,
            userEmail: data.user?.email
          });

          // Store auth data
          localStorage.setItem('authToken', data.jwt);
          localStorage.setItem('userData', JSON.stringify(data.user));

          set({
            isAuthenticated: true,
            user: data.user,
            token: data.jwt,
            error: null
          });

          return { success: true, user: data.user };

        } catch (error) {
          console.error('Login error:', error);
          let errorMessage = error.message;
          
          // Handle network errors
          if (error.message.includes('fetch')) {
            errorMessage = 'Unable to connect to server. Please check if Strapi is running.';
          }
          
          setError(errorMessage);
          return { success: false, error: errorMessage };
        } finally {
          setLoading(false);
        }
      },

      // Logout user
      logout: () => {
        console.log('Logging out user');
        
        // Clear localStorage
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');

        // Clear state
        set({
          isAuthenticated: false,
          user: null,
          token: null,
          error: null
        });
      },

      // Verify token with Strapi
      verifyToken: async (token) => {
        try {
          const apiUrl = process.env.REACT_APP_STRAPI_URL || 'http://localhost:1337';
          console.log('Verifying token with:', `${apiUrl}/api/users/me`);
          
          const response = await fetch(`${apiUrl}/api/users/me`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          console.log('Token verification response status:', response.status);
          return response.ok;
        } catch (error) {
          console.error('Token verification failed:', error);
          return false;
        }
      },

      // Test Strapi connection
      testConnection: async () => {
        try {
          const apiUrl = process.env.REACT_APP_STRAPI_URL || 'http://localhost:1337';
          console.log('Testing connection to:', apiUrl);
          
          const response = await fetch(`${apiUrl}/api/health`, {
            method: 'GET'
          });
          
          console.log('Health check response:', response.status);
          return { success: response.ok, status: response.status };
        } catch (error) {
          console.error('Connection test failed:', error);
          return { success: false, error: error.message };
        }
      },

      // Register new user (if needed)
      register: async (userData) => {
        const { setLoading, setError } = get();
        
        try {
          setLoading(true);
          setError(null);

          const apiUrl = process.env.REACT_APP_STRAPI_URL || 'http://localhost:1337';
          console.log('Attempting registration to:', `${apiUrl}/api/auth/local/register`);

          const response = await fetch(`${apiUrl}/api/auth/local/register`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
          });

          if (!response.ok) {
            const errorData = await response.json();
            console.error('Registration error response:', errorData);
            throw new Error(errorData.error?.message || 'Registration failed');
          }

          const data = await response.json();
          console.log('Registration successful');

          // Store auth data
          localStorage.setItem('authToken', data.jwt);
          localStorage.setItem('userData', JSON.stringify(data.user));

          set({
            isAuthenticated: true,
            user: data.user,
            token: data.jwt,
            error: null
          });

          return { success: true, user: data.user };

        } catch (error) {
          console.error('Registration error:', error);
          const errorMessage = error.message || 'Registration failed.';
          setError(errorMessage);
          return { success: false, error: errorMessage };
        } finally {
          setLoading(false);
        }
      },

      // Get user info
      getUserInfo: () => {
        const { user } = get();
        return user;
      },

      // Check if user has specific role/permission
      hasRole: (role) => {
        const { user } = get();
        return user?.role?.type === role;
      },

      // Get auth token for API calls
      getToken: () => {
        const { token } = get();
        return token;
      }
    }),
    {
      name: 'auth-storage',
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          return str ? JSON.parse(str) : null;
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          localStorage.removeItem(name);
        }
      },
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        token: state.token
      })
    }
  )
);

export default useAuthStore;