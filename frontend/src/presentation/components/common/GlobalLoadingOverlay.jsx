import React, { useEffect, useState } from 'react';
import { useIsFetching } from 'react-query';
import { useLoading } from '../../../application/contexts/LoadingContext';
import useStudentStore from '../../../application/stores/useStudentStore';
import { useEnrollmentStore } from '../../../application/stores/useEnrollmentStore';
import useAuthStore from '../../../application/stores/useAuthStore';
import { UI_CONFIG } from '../../../shared/constants/app';

// Enhanced Loading Animation Component
const ModernLoadingSpinner = ({ message, loadingCount }) => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev.length >= 3) return '';
        return prev + '.';
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center space-y-6">
      {/* Modern Spinner */}
      <div className="relative">
        {/* Outer ring */}
        <div className="w-16 h-16 border-4 border-blue-100 rounded-full animate-pulse"></div>
        {/* Inner spinning ring */}
        <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-500 border-r-blue-400 rounded-full animate-spin"></div>
        {/* Center pulse */}
        <div className="absolute inset-0 w-16 h-16 flex items-center justify-center">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-ping"></div>
        </div>
      </div>

      {/* Loading Text with Animation */}
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold text-gray-800 animate-pulse">
          {message || 'Loading'}{dots}
        </h3>
        {loadingCount > 1 && (
          <p className="text-xs text-gray-500">
            {loadingCount} operations in progress
          </p>
        )}
        <p className="text-sm text-gray-500 max-w-xs">
          Please wait while we process your request
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-48 h-1 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full animate-pulse"></div>
      </div>
    </div>
  );
};

// Background Pattern Component
const BackgroundPattern = () => (
  <div className="absolute inset-0 opacity-5">
    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100"></div>
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" className="text-gray-200"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>
  </div>
);

export const GlobalLoadingOverlay = () => {
  // Use the new loading context
  const { isLoading: contextLoading, currentMessage, loadingCount } = useLoading();

  // Keep legacy store integrations for backward compatibility
  const isFetching = useIsFetching();
  const studentLoading = useStudentStore((s) => s.loading);
  const enrollmentLoading = useEnrollmentStore((s) => s.loading);
  const authLoading = useAuthStore((s) => s.loading);

  // Combine all loading states
  const active = Boolean(
    contextLoading ||
    isFetching ||
    studentLoading ||
    enrollmentLoading ||
    authLoading
  );

  const [visible, setVisible] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);

  // Determine loading context for better messaging
  const getLoadingMessage = () => {
    // Priority: context message > store-specific messages > default
    if (currentMessage && contextLoading) return currentMessage;
    if (authLoading) return 'Authenticating';
    if (studentLoading) return 'Processing Student Data';
    if (enrollmentLoading) return 'Managing Enrollment';
    if (isFetching) return 'Fetching Data';
    return 'Loading';
  };

  useEffect(() => {
    let timer;
    if (active) {
      timer = setTimeout(() => {
        setVisible(true);
        // Trigger fade-in animation after visibility
        setTimeout(() => setFadeIn(true), 50);
      }, UI_CONFIG.LOADING_SPINNER_DELAY || 200);
    } else {
      setFadeIn(false);
      // Delay hiding to allow fade-out animation
      setTimeout(() => setVisible(false), 200);
    }
    return () => timer && clearTimeout(timer);
  }, [active]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] transition-all duration-300 ${
        fadeIn ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Enhanced Backdrop - now blocks interaction */}
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm">
        <BackgroundPattern />
      </div>

      {/* Loading Content */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          className={`bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/50 p-8 max-w-sm w-full mx-4 transform transition-all duration-500 ${
            fadeIn ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
          }`}
        >
          <ModernLoadingSpinner
            message={getLoadingMessage()}
            loadingCount={loadingCount}
          />

          {/* Tips Section */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-center text-xs text-gray-400">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Tip: All changes are automatically saved
            </div>
          </div>
        </div>
      </div>

      {/* Subtle Animation Elements */}
      <div className="absolute top-10 left-10 w-2 h-2 bg-blue-400 rounded-full animate-ping opacity-20"></div>
      <div className="absolute top-20 right-20 w-1 h-1 bg-indigo-400 rounded-full animate-pulse opacity-30"></div>
      <div className="absolute bottom-20 left-20 w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce opacity-20"></div>
      <div className="absolute bottom-10 right-10 w-2 h-2 bg-pink-400 rounded-full animate-ping opacity-20" style={{ animationDelay: '0.5s' }}></div>
    </div>
  );
};