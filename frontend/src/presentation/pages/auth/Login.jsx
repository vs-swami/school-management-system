import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../../../application/stores/useAuthStore';

export const Login = () => {
  const { login, loading, error, isAuthenticated } = useAuthStore();
  const [credentials, setCredentials] = useState({
    identifier: '',
    password: ''
  });

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

 const handleSubmit = async (e) => {
  e.preventDefault();
  await login(credentials.identifier, credentials.password);
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            School Management System
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to your account
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          <div>
            <label htmlFor="identifier" className="sr-only">
              Username
            </label>
            <input
              id="identifier"
              name="identifier"
              type="text"
              required
              className="input"
              placeholder="Username"
              value={credentials.identifier}
              onChange={(e) => setCredentials({ ...credentials, identifier: e.target.value })}
            />
          </div>
          
          <div>
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="input"
              placeholder="Password"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
          
          <div className="text-center text-sm text-gray-600">
            <p>Demo credentials: admin / admin123</p>
          </div>
        </form>
      </div>
    </div>
  );
};