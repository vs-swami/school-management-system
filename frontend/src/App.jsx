import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { MainLayout } from './presentation/layouts/MainLayout';
import { Dashboard } from './presentation/pages/dashboard/Dashboard';
import { StudentList } from './presentation/pages/students/StudentList';
import { EnrollmentList } from './presentation/pages/enrollment/EnrollmentList';
import { EnrollmentAdminPage } from './presentation/pages/enrollment/EnrollmentAdminPage';
import { Login } from './presentation/pages/auth/Login';
import { ProtectedRoute } from './presentation/components/auth/ProtectedRoute';
import useAuthStore from './application/stores/useAuthStore';
import './styles/globals.css';
import { StudentPage } from './presentation/pages/students/StudentPage';

// Fee Management Pages
import FeeDashboard from './presentation/pages/fees/FeeDashboard';
import FeeStructure from './presentation/pages/fees/FeeStructure';
import PaymentProcessing from './presentation/pages/fees/PaymentProcessing';
import PaymentHistory from './presentation/pages/fees/PaymentHistory';
import FeeDemo from './presentation/pages/fees/FeeDemo';
import FeeManagement from './presentation/pages/fees/FeeManagement';
import ClassFeeManagementPage from './presentation/pages/fees/ClassFeeManagementPage';
import ClassManagement from './presentation/pages/classes/ClassManagement';
import EnhancedClassManagement from './presentation/pages/classes/EnhancedClassManagement';
import DivisionManagementDashboard from './presentation/pages/classes/DivisionManagementDashboard';
import ClassDivisionDashboard from './presentation/pages/classes/ClassDivisionDashboard';
import BusManagementDashboard from './presentation/pages/transport/BusManagementDashboard';

// Error Boundary and Configuration
import ErrorBoundary from './presentation/components/common/ErrorBoundary';
import { initializeEnvironment } from './shared/utils/envValidation';
import { API_CONFIG, ENV_CONFIG } from './shared/constants/app';
import { GlobalLoadingOverlay } from './presentation/components/common/GlobalLoadingOverlay';

// Initialize environment validation
let envConfig;
try {
  envConfig = initializeEnvironment();
  console.log('Environment initialized successfully:', envConfig);
} catch (error) {
  console.error('Environment initialization failed:', error.message);
  // In production, you might want to show a user-friendly error page
  // For development, we'll let it continue but log the error
}

// Configure React Query with shared constants
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: API_CONFIG.RETRY_ATTEMPTS,
      retryDelay: attemptIndex => Math.min(API_CONFIG.RETRY_DELAY * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

function App() {
  const { isAuthenticated, initializeAuth } = useAuthStore();

  React.useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
          <div className="App">
            <ErrorBoundary>
              <GlobalLoadingOverlay />
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route
                  path="/*"
                  element={
                    <ProtectedRoute isAuthenticated={isAuthenticated}>
                      <MainLayout>
                        <ErrorBoundary>
                          <Routes>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/students" element={<StudentList />} />
                            <Route path="/students/new" element={<StudentPage mode="create" />} />
                            <Route path="/students/edit/:id" element={<StudentPage mode="edit" />} />
                            <Route path="/enrollments" element={<EnrollmentList />} />
                            <Route path="/enrollments/:id/admin" element={<EnrollmentAdminPage />} />

                            {/* Class Management Routes */}
                            <Route path="/classes" element={<ClassDivisionDashboard />} />
                            <Route path="/classes/:classId/fees" element={<ClassFeeManagementPage />} />

                            {/* Transport Management Routes */}
                            <Route path="/transport" element={<BusManagementDashboard />} />

                            {/* Fee Management Routes */}
                            <Route path="/fees" element={<FeeManagement />} />
                            <Route path="/fees/manage" element={<FeeManagement />} />
                            <Route path="/fees/demo" element={<FeeDemo />} />
                            <Route path="/fees/dashboard" element={<FeeDashboard />} />
                            <Route path="/fees/structure" element={<FeeStructure />} />
                            <Route path="/fees/payments" element={<PaymentProcessing />} />
                            <Route path="/fees/history" element={<PaymentHistory />} />
                          </Routes>
                        </ErrorBoundary>
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </ErrorBoundary>
          </div>
        </Router>

        {/* React Query DevTools - only shown in development */}
        {ENV_CONFIG.IS_DEVELOPMENT && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
