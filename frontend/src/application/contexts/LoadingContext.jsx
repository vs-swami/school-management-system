import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

const LoadingContext = createContext();

export const LoadingProvider = ({ children }) => {
  const [loadingStates, setLoadingStates] = useState({});
  const loadingIdCounter = useRef(0);

  // Start loading with optional message
  const startLoading = useCallback((message = 'Loading', identifier = null) => {
    const id = identifier || `loading_${++loadingIdCounter.current}`;

    setLoadingStates(prev => ({
      ...prev,
      [id]: {
        active: true,
        message,
        startTime: Date.now()
      }
    }));

    return id;
  }, []);

  // Stop loading for a specific identifier
  const stopLoading = useCallback((identifier) => {
    if (!identifier) return;

    setLoadingStates(prev => {
      const newState = { ...prev };
      delete newState[identifier];
      return newState;
    });
  }, []);

  // Stop all loading states
  const stopAllLoading = useCallback(() => {
    setLoadingStates({});
  }, []);

  // Check if any loading is active
  const isLoading = Object.keys(loadingStates).length > 0;

  // Get the most recent loading message
  const currentMessage = (() => {
    const states = Object.values(loadingStates);
    if (states.length === 0) return '';

    // Return the most recently added loading message
    const mostRecent = states.reduce((latest, current) =>
      current.startTime > latest.startTime ? current : latest
    );

    return mostRecent.message || 'Loading';
  })();

  // Get count of active loading operations
  const loadingCount = Object.keys(loadingStates).length;

  const value = {
    startLoading,
    stopLoading,
    stopAllLoading,
    isLoading,
    currentMessage,
    loadingCount,
    loadingStates
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  );
};

// Hook to use loading context
export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

// Higher-order hook for async operations with loading state
export const useAsyncWithLoading = (asyncFunction, loadingMessage = 'Processing') => {
  const { startLoading, stopLoading } = useLoading();

  const execute = useCallback(async (...args) => {
    const loadingId = startLoading(loadingMessage);
    try {
      const result = await asyncFunction(...args);
      return result;
    } finally {
      stopLoading(loadingId);
    }
  }, [asyncFunction, loadingMessage, startLoading, stopLoading]);

  return execute;
};

// Utility hook for component-level loading
export const useComponentLoading = (componentName) => {
  const { startLoading, stopLoading } = useLoading();
  const loadingIdRef = useRef(null);

  const setLoading = useCallback((isLoading, message = null) => {
    if (isLoading) {
      if (loadingIdRef.current) {
        stopLoading(loadingIdRef.current);
      }
      loadingIdRef.current = startLoading(
        message || `Loading ${componentName}`,
        `${componentName}_${Date.now()}`
      );
    } else {
      if (loadingIdRef.current) {
        stopLoading(loadingIdRef.current);
        loadingIdRef.current = null;
      }
    }
  }, [componentName, startLoading, stopLoading]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (loadingIdRef.current) {
        stopLoading(loadingIdRef.current);
      }
    };
  }, [stopLoading]);

  return setLoading;
};