import React from 'react';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { Layout } from '../components/Layout'; // Import the new Layout component
import useAuthStore from '../../application/stores/useAuthStore';

export const MainLayout = ({ children }) => {
  const { user } = useAuthStore();

  if (!user) {
    return null;
  }

  return (
    <Layout>
      {children}
    </Layout>
  );
};