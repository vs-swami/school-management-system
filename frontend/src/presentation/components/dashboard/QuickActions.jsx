import React from 'react';

export const QuickActions = () => {
  const actions = [
    {
      id: 'add-student',
      title: 'Add New Student',
      description: 'Enroll a new student',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      ),
      color: 'green',
      href: '/students/new'
    },
    {
      id: 'mark-attendance',
      title: 'Mark Attendance',
      description: 'Record daily attendance',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      color: 'blue',
      href: '/attendance'
    },
    {
      id: 'generate-report',
      title: 'Generate Report',
      description: 'Create academic reports',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: 'purple',
      href: '/reports'
    },
    {
      id: 'manage-fees',
      title: 'Manage Fees',
      description: 'Handle fee collection',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'orange',
      href: '/fees'
    },
    {
      id: 'view-documents',
      title: 'Review Documents',
      description: 'Check pending documents',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: 'yellow',
      href: '/documents'
    },
    {
      id: 'schedule-class',
      title: 'Schedule Class',
      description: 'Plan class schedules',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: 'indigo',
      href: '/schedule'
    }
  ];

  // Color classes for different action types
  const getColorClasses = (color) => {
    const colorMap = {
      green: 'bg-green-50 text-green-700 hover:bg-green-100 border-green-200',
      blue: 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200',
      purple: 'bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200',
      orange: 'bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-200',
      yellow: 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border-yellow-200',
      indigo: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200'
    };
    return colorMap[color] || colorMap.blue;
  };

  const handleActionClick = (action) => {
    // For now, just log the action
    console.log(`Quick action clicked: ${action.title}`);
    
    // You can add navigation logic here
    // For example: navigate(action.href);
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
        <button className="text-sm text-primary-600 hover:text-primary-700">
          Customize
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => handleActionClick(action)}
            className={`
              p-4 rounded-lg border transition-all duration-200 text-left
              ${getColorClasses(action.color)}
            `}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                {action.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium mb-1">
                  {action.title}
                </p>
                <p className="text-xs opacity-75">
                  {action.description}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
      
      {/* View All Actions Button */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <button 
          className="w-full text-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
          onClick={() => console.log('View all actions clicked')}
        >
          View All Actions
          <svg className="w-4 h-4 ml-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};