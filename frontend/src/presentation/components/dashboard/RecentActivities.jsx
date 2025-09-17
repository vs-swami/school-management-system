import React from 'react';

export const RecentActivities = ({ activities = [] }) => {
  // Format activity message
  const formatActivityMessage = (activity) => {
    if (activity.message) return activity.message;
    if (activity.action) return activity.action;
    if (activity.details) return activity.details;
    return 'Activity occurred';
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Unknown time';
    
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      
      if (diffInMinutes < 1) return 'Just now';
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    } catch (error) {
      return 'Unknown time';
    }
  };

  // Get activity icon based on type
  const getActivityIcon = (activity) => {
    const type = activity.action || activity.eventType || activity.type || '';
    
    if (type.includes('STUDENT_CREATED') || type.includes('enrolled')) {
      return (
        <div className="bg-green-100 p-2 rounded-full">
          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        </div>
      );
    }
    
    if (type.includes('STUDENT_UPDATED') || type.includes('updated')) {
      return (
        <div className="bg-blue-100 p-2 rounded-full">
          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </div>
      );
    }
    
    if (type.includes('LOGIN') || type.includes('login')) {
      return (
        <div className="bg-purple-100 p-2 rounded-full">
          <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
        </div>
      );
    }
    
    // Default icon
    return (
      <div className="bg-gray-100 p-2 rounded-full">
        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    );
  };

  return (
    <div className="card p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Recent Activities</h3>
        <button className="text-sm sm:text-base text-primary-600 hover:text-primary-700">
          View All
        </button>
      </div>
      
      {activities.length === 0 ? (
        <div className="text-center py-8">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-gray-500">No recent activities</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activities.slice(0, 8).map((activity, index) => (
            <div key={activity.id || index} className="flex items-start space-x-3">
              {getActivityIcon(activity)}
              
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 mb-1">
                  {formatActivityMessage(activity)}
                </p>
                <div className="flex items-center text-xs text-gray-500 space-x-2">
                  <span>{activity.user || 'System'}</span>
                  <span>•</span>
                  <span>{formatTimestamp(activity.createdAt || activity.timestamp)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};