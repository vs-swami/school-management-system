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
import FeeManagement from './presentation/pages/fees/FeeManagement';
import ClassDivisionDashboard from './presentation/pages/classes/ClassDivisionDashboard';
import BusManagementDashboard from './presentation/pages/transport/BusManagementDashboard';

// Finance Management Pages
import FinanceDashboard from './presentation/pages/Finance/Dashboard/FinanceDashboard';
import FeeCollection from './presentation/pages/Finance/FeeCollection/FeeCollection';
import WalletManagement from './presentation/pages/Finance/Wallets/WalletManagement';
import PendingPayments from './presentation/pages/Finance/PendingPayments';
import PaymentSchedules from './presentation/pages/Finance/Schedules/PaymentSchedules';
import ScheduleDetails from './presentation/pages/Finance/Schedules/ScheduleDetails';
import Transactions from './presentation/pages/Finance/Transactions/Transactions';
import StudentFinanceDetails from './presentation/pages/students/StudentFinanceDetails';
import StudentView from './presentation/pages/students/StudentView';

// Error Boundary and Configuration
import ErrorBoundary from './presentation/components/common/ErrorBoundary';
import { initializeEnvironment } from './shared/utils/envValidation';
import { API_CONFIG, ENV_CONFIG } from './shared/constants/app';
import { GlobalLoadingOverlay } from './presentation/components/common/GlobalLoadingOverlay';
import { LoadingProvider } from './application/contexts/LoadingContext';
import { ServiceProvider } from './application/contexts/ServiceContext';

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
        <ServiceProvider>
          <LoadingProvider>
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
                            <Route path="/students/view/:id" element={<StudentView />} />
                            <Route path="/students/edit/:id" element={<StudentPage mode="edit" />} />
                            <Route path="/students/:studentId/finance" element={<StudentFinanceDetails />} />
                            <Route path="/enrollments" element={<EnrollmentList />} />
                            <Route path="/enrollments/:id/admin" element={<EnrollmentAdminPage />} />

                            {/* Class Management Routes */}
                            <Route path="/classes" element={<ClassDivisionDashboard />} />

                            {/* Transport Management Routes */}
                            <Route path="/transport" element={<BusManagementDashboard />} />

                            {/* Fee Management Routes */}
                            <Route path="/fees" element={<FeeManagement />} />
                            <Route path="/fees/manage" element={<FeeManagement />} />

                            {/* Finance Management Routes */}
                            <Route path="/finance" element={<FinanceDashboard />} />
                            <Route path="/finance/dashboard" element={<FinanceDashboard />} />
                            <Route path="/finance/fee-collection" element={<FeeCollection />} />
                            <Route path="/finance/wallets" element={<WalletManagement />} />
                            <Route path="/finance/pending-payments" element={<PendingPayments />} />
                            <Route path="/finance/schedules" element={<PaymentSchedules />} />
                            <Route path="/finance/schedules/:scheduleId" element={<ScheduleDetails />} />
                            <Route path="/finance/transactions" element={<Transactions />} />
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
          </LoadingProvider>
        </ServiceProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
