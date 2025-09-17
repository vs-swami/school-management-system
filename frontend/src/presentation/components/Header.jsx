import React from 'react';
import useAuthStore from '../../application/stores/useAuthStore';
import { Menu } from 'lucide-react';

export const Header = ({ toggleSidebar }) => {
  const { user, logout } = useAuthStore();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-4 sm:px-6 py-4 flex justify-between items-center">
        <button
          className="md:hidden text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md"
          aria-label="Open sidebar"
          onClick={toggleSidebar}
        >
          <Menu className="h-6 w-6" />
        </button>
        <h1 className="hidden md:block text-xl font-semibold text-gray-900">
          School Management System
        </h1>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Welcome, {user?.username}
            </span>
            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
              {user?.role}
            </span>
            <button
              onClick={logout}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Logout
            </button>
          </div>
        </div>
    </header>
  );
};