// This file provides a unified way to handle loading states across components
// It ensures all components use the global loading overlay instead of local spinners

import { useComponentLoading } from '../../../application/contexts/LoadingContext';

/**
 * Hook that replaces local loading state with global loading
 * Use this to migrate components from local loading to global loading
 *
 * @param {string} componentName - Name of the component for logging
 * @returns {Function} setLoading function that works with global overlay
 */
export const useGlobalLoading = (componentName) => {
  return useComponentLoading(componentName);
};

/**
 * HOC to wrap async functions with global loading
 * @param {Function} asyncFn - The async function to wrap
 * @param {string} loadingMessage - Message to display while loading
 * @param {Function} setLoading - The setLoading function from useGlobalLoading
 * @returns {Function} Wrapped async function
 */
export const withGlobalLoading = (asyncFn, loadingMessage, setLoading) => {
  return async (...args) => {
    setLoading(true, loadingMessage);
    try {
      const result = await asyncFn(...args);
      return result;
    } finally {
      setLoading(false);
    }
  };
};

/**
 * Empty placeholder component - use when removing local loading UI
 * This prevents breaking changes when removing if(loading) blocks
 */
export const LoadingPlaceholder = () => null;