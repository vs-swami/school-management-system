import { create } from 'zustand';
import DashboardService from '../services/DashboardService';

// Dashboard store that uses DashboardService
export const useDashboardStore = create((set, get) => ({
  // Loading states
  isLoading: false,
  isMetricsLoading: false,
  isStudentsLoading: false,
  
  // Loading state for Dashboard component compatibility
  loading: false,
  
  // Data from your Strapi metrics endpoint via service
  metrics: {
    totalStudents: 0,
    currentEnrollments: 0,
    pendingDocuments: 0,
    activeTransport: 0
  },
  
  statistics: {
    students: null,
    enrollments: null
  },
  
  recentActivities: [],
  recentStudents: [],
  currentAcademicYear: null,
  
  // Error states
  error: null,
  metricsError: null,
  studentsError: null,
  
  // Actions
  setLoading: (loading) => set({ isLoading: loading, loading }),
  setMetricsLoading: (loading) => set({ isMetricsLoading: loading }),
  setStudentsLoading: (loading) => set({ isStudentsLoading: loading }),
  
  setError: (error) => set({ error }),
  setMetricsError: (error) => set({ metricsError: error }),
  setStudentsError: (error) => set({ studentsError: error }),
  
  clearErrors: () => set({ 
    error: null, 
    metricsError: null, 
    studentsError: null 
  }),

  // Fetch dashboard data - alias for Dashboard component compatibility
  fetchDashboardData: async () => {
    const { fetchMetrics } = get();
    await fetchMetrics();
  },

  // Fetch metrics using DashboardService
  fetchMetrics: async () => {
    set({ isMetricsLoading: true, loading: true, metricsError: null });
    
    try {
      const result = await DashboardService.getMetrics();
      
      if (result.success) {
        set({
          metrics: result.data.metrics,
          statistics: result.data.statistics,
          recentActivities: result.data.recentActivities,
          metricsError: null
        });
      } else {
        set({ metricsError: result.error });
      }
      
    } catch (error) {
      console.error('Store Error fetching metrics:', error);
      set({ metricsError: error.message });
    } finally {
      set({ isMetricsLoading: false, loading: false });
    }
  },

  // Fetch recent students using DashboardService
  fetchRecentStudents: async (limit = 10) => {
    set({ isStudentsLoading: true, studentsError: null });
    
    try {
      const result = await DashboardService.getRecentStudents(limit);
      
      if (result.success) {
        set({ 
          recentStudents: result.data,
          studentsError: null 
        });
      } else {
        set({ studentsError: result.error });
      }
      
    } catch (error) {
      console.error('Store Error fetching students:', error);
      set({ studentsError: error.message });
    } finally {
      set({ isStudentsLoading: false });
    }
  },

  // Fetch current academic year using DashboardService
  fetchCurrentAcademicYear: async () => {
    try {
      const result = await DashboardService.getCurrentAcademicYear();
      
      if (result.success) {
        set({ currentAcademicYear: result.data });
      }
      
    } catch (error) {
      console.error('Store Error fetching academic year:', error);
    }
  },

  // Initialize dashboard - fetch all data
  initializeDashboard: async () => {
    const { fetchMetrics, fetchCurrentAcademicYear } = get();
    
    set({ isLoading: true, error: null });
    
    try {
      // Fetch main metrics
      await fetchMetrics();
      
      // Fetch additional data
      await fetchCurrentAcademicYear();
      
    } catch (error) {
      console.error('Store Error initializing dashboard:', error);
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },

  // Refresh all data
  refreshDashboard: async () => {
    const { fetchMetrics } = get();
    
    try {
      // Refresh service data
      await DashboardService.refreshData();
      
      // Fetch updated metrics
      await fetchMetrics();
      
    } catch (error) {
      console.error('Store Error refreshing dashboard:', error);
      set({ error: error.message });
    }
  },

  // Create audit log using DashboardService
  createAuditLog: async (eventType, details = {}, context = {}) => {
    try {
      const result = await DashboardService.createAuditLog(eventType, details, context);
      
      if (result.success) {
        // Refresh activities to show new log
        const { fetchMetrics } = get();
        await fetchMetrics();
      }
      
      return result;
      
    } catch (error) {
      console.error('Store Error creating audit log:', error);
      return { success: false, error: error.message };
    }
  },

  // Get formatted metrics for UI display
  getFormattedMetrics: () => {
    const { metrics } = get();
    
    return [
      {
        title: 'Total Students',
        value: metrics.totalStudents?.toLocaleString() || '0',
        icon: 'users',
        color: 'blue'
      },
      {
        title: 'Current Enrollments',
        value: metrics.currentEnrollments?.toLocaleString() || '0',
        icon: 'academic-cap',
        color: 'green'
      },
      {
        title: 'Pending Documents',
        value: metrics.pendingDocuments?.toLocaleString() || '0',
        icon: 'document-text',
        color: metrics.pendingDocuments > 50 ? 'orange' : 'yellow'
      },
      {
        title: 'Active Transport',
        value: metrics.activeTransport?.toLocaleString() || '0',
        icon: 'truck',
        color: 'purple'
      }
    ];
  },

  // Get dashboard summary
  getDashboardSummary: () => {
    const { metrics, statistics, recentActivities, currentAcademicYear } = get();
    
    return {
      totalStudents: metrics.totalStudents || 0,
      totalActivities: recentActivities?.length || 0,
      hasStatistics: !!(statistics.students || statistics.enrollments),
      academicYear: currentAcademicYear?.attributes?.name || 'Not Set',
      lastUpdated: new Date().toISOString()
    };
  },

  // Get health check using DashboardService
  getHealthCheck: async () => {
    try {
      const result = await DashboardService.getHealthCheck();
      return result;
    } catch (error) {
      console.error('Store Error getting health check:', error);
      return { 
        success: false, 
        error: error.message,
        data: { status: 'unhealthy' }
      };
    }
  },

  // Reset store
  reset: () => set({
    isLoading: false,
    isMetricsLoading: false,
    isStudentsLoading: false,
    loading: false,
    metrics: {
      totalStudents: 0,
      currentEnrollments: 0,
      pendingDocuments: 0,
      activeTransport: 0
    },
    statistics: {
      students: null,
      enrollments: null
    },
    recentActivities: [],
    recentStudents: [],
    currentAcademicYear: null,
    error: null,
    metricsError: null,
    studentsError: null
  })
}));

export default useDashboardStore;