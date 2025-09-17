import React, { useEffect } from 'react';
import { useDashboardStore } from '../../../application/stores/useDashboardStore';
import { MetricsCard } from '../../components/dashboard/MetricsCard';
import { RecentActivities } from '../../components/dashboard/RecentActivities';
import { QuickActions } from '../../components/dashboard/QuickActions';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorAlert } from '../../components/common/ErrorAlert';

export const Dashboard = () => {
  const {
    metrics,
    recentActivities,
    loading,
    error,
    fetchDashboardData
  } = useDashboardStore();

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorAlert message={error} />;
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
        Dashboard Overview
      </h1>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4">
        <MetricsCard
          title="Total Students"
          value={metrics?.totalStudents || 0}
          icon="users"
          color="blue"
        />
        <MetricsCard
          title="Current Enrollments"
          value={metrics?.currentEnrollments || 0}
          icon="academic-cap"
          color="green"
        />
        <MetricsCard
          title="Pending Documents"
          value={metrics?.pendingDocuments || 0}
          icon="document-text"
          color="yellow"
        />
        <MetricsCard
          title="Active Transport"
          value={metrics?.activeTransport || 0}
          icon="truck"
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <QuickActions />
        
        {/* Recent Activities */}
        <RecentActivities activities={recentActivities} />
      </div>
    </div>
  );
};