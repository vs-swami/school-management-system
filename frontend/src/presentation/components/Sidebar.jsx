import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, BookOpen, FileText, X, DollarSign } from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Students', href: '/students', icon: Users },
  { name: 'Enrollments', href: '/enrollments', icon: BookOpen },
  { name: 'Fee Management', href: '/fees', icon: DollarSign },
  { name: 'Reports', href: '/reports', icon: FileText },
];

export const Sidebar = ({ toggleSidebar }) => {
  const location = useLocation();

  return (
    <aside className="w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen flex flex-col">
      <div className="p-4 flex justify-between items-center md:hidden">
        <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
        <button
          className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md"
          aria-label="Close sidebar"
          onClick={toggleSidebar}
        >
          <X className="h-6 w-6" />
        </button>
      </div>
      <nav className="p-4 flex-1">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            
            return (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};