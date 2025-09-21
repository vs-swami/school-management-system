import React, { createContext, useContext, useMemo } from 'react';

// Import Repository Adapters
import {
  StudentRepositoryAdapter,
  ClassRepositoryAdapter,
  BusStopRepositoryAdapter,
  FeeRepositoryAdapter
} from '../../data/adapters';

// Import Services
import { ClassService } from '../services/ClassService';
import { StudentServices } from '../services/StudentServices';

// Create context
const DependencyContext = createContext(null);

// Provider component
export const DependencyProvider = ({ children, config = {} }) => {
  const dependencies = useMemo(() => {
    // Initialize repositories
    const repositories = {
      student: new StudentRepositoryAdapter(),
      class: new ClassRepositoryAdapter(),
      busStop: new BusStopRepositoryAdapter(),
      fee: new FeeRepositoryAdapter(),
    };

    // Initialize services
    const services = {
      class: new ClassService(),
      student: new StudentServices(),
      // Add more services as they are updated
    };

    // Allow overriding repositories for testing
    if (config.repositories) {
      Object.assign(repositories, config.repositories);
    }

    // Allow overriding services for testing
    if (config.services) {
      Object.assign(services, config.services);
    }

    return {
      repositories,
      services,
    };
  }, [config]);

  return (
    <DependencyContext.Provider value={dependencies}>
      {children}
    </DependencyContext.Provider>
  );
};

// Hook to use dependencies
export const useDependencies = () => {
  const context = useContext(DependencyContext);

  if (!context) {
    throw new Error('useDependencies must be used within a DependencyProvider');
  }

  return context;
};

// Specific hooks for convenience
export const useServices = () => {
  const { services } = useDependencies();
  return services;
};

export const useRepositories = () => {
  const { repositories } = useDependencies();
  return repositories;
};

// Service-specific hooks
export const useClassService = () => {
  const { services } = useDependencies();
  return services.class;
};

export const useStudentService = () => {
  const { services } = useDependencies();
  return services.student;
};

// Repository-specific hooks
export const useStudentRepository = () => {
  const { repositories } = useDependencies();
  return repositories.student;
};

export const useClassRepository = () => {
  const { repositories } = useDependencies();
  return repositories.class;
};

export const useBusStopRepository = () => {
  const { repositories } = useDependencies();
  return repositories.busStop;
};

export const useFeeRepository = () => {
  const { repositories } = useDependencies();
  return repositories.fee;
};