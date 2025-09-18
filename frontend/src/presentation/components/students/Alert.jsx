import React from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

/**
 * Alert component for displaying success and error messages
 * Memoized to prevent unnecessary re-renders when message hasn't changed
 *
 * @param {string} type - Alert type ('success' or 'error')
 * @param {string} message - Message to display
 */
const Alert = React.memo(({ type, message }) => {
  const isSuccess = type === 'success';
  const bgColor = isSuccess ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200';
  const textColor = isSuccess ? 'text-green-800' : 'text-red-800';
  const iconColor = isSuccess ? 'text-green-400' : 'text-red-400';
  const Icon = isSuccess ? CheckCircle : AlertCircle;

  return (
    <div className={`${bgColor} border rounded-md p-4`}>
      <div className="flex">
        <Icon className={`h-5 w-5 ${iconColor} mr-2 mt-0.5 flex-shrink-0`} />
        <div>
          <h3 className={`text-sm font-medium ${textColor}`}>
            {isSuccess ? 'Success' : 'Error'}
          </h3>
          <p className={`mt-1 text-sm ${textColor.replace('800', '700')}`}>
            {message}
          </p>
        </div>
      </div>
    </div>
  );
});

Alert.displayName = 'Alert';

export default Alert;