import React, { useState } from 'react';
import { Header } from './Header.jsx';
import { Sidebar } from './Sidebar.jsx';

export const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar for larger screens, hidden on mobile by default */}
      <div className={`fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-50 md:relative md:translate-x-0 transform ${isSidebarOpen ? 'translate-x-0 ease-out transition-transform duration-300' : '-translate-x-full ease-in transition-transform duration-300'} md:flex flex-col`}>
        <Sidebar toggleSidebar={toggleSidebar} />
      </div>

      {/* Overlay for mobile when sidebar is open */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-40 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      <div className="flex-1 flex flex-col">
        <Header toggleSidebar={toggleSidebar} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};
