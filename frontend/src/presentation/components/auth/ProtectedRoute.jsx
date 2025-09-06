import React from 'react';
import { Navigate } from 'react-router-dom';

export const ProtectedRoute = ({ children, isAuthenticated }) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};