import React from 'react';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import useAuthStore from '../../application/stores/useAuthStore';

export const MainLayout = ({ children }) => {
  const { user } = useAuthStore();

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};