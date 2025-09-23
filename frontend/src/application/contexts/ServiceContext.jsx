import React, { createContext, useContext, useMemo } from 'react';

// Import Services
import { ClassService } from '../services/ClassService';
import { StudentService } from '../services/StudentServices';
import { BusStopService } from '../services/BusStopService';
import { BusRouteService } from '../services/BusRouteService';
import { EnrollmentService } from '../services/EnrollmentService';
import { DivisionService } from '../services/DivisionService';
import { ExamResultService } from '../services/ExamResultService';
import { GuardianService } from '../services/GuardianService';
import { FeeService } from '../services/FeeService';
import { LocationService } from '../services/LocationService';
import { FeeTypeService } from '../services/FeeTypeService';
import { AcademicYearService } from '../services/AcademicYearService';
import { BusService } from '../services/BusService';
import { PaymentScheduleService } from '../services/PaymentScheduleService';
import { TransactionService } from '../services/TransactionService';
import { StudentWalletService } from '../services/StudentWalletService';

// Create context
export const ServiceContext = createContext(null);

// Provider component
export const ServiceProvider = ({ children, config = {} }) => {
  const services = useMemo(() => {
    const serviceInstances = {
      class: new ClassService(),
      student: new StudentService(),
      busStop: new BusStopService(),
      busRoute: new BusRouteService(),
      enrollment: new EnrollmentService(),
      division: new DivisionService(),
      examResult: new ExamResultService(),
      guardian: new GuardianService(),
      fee: new FeeService(),
      location: new LocationService(),
      feeType: new FeeTypeService(),
      academicYear: new AcademicYearService(),
      bus: new BusService(),
      paymentSchedule: new PaymentScheduleService(),
      transaction: new TransactionService(),
      studentWallet: new StudentWalletService(),
      // Add more services as they are created/updated
    };

    // Allow overriding services for testing
    if (config.services) {
      Object.assign(serviceInstances, config.services);
    }

    return serviceInstances;
  }, [config]);

  return (
    <ServiceContext.Provider value={services}>
      {children}
    </ServiceContext.Provider>
  );
};

// Hook to use all services
export const useServices = () => {
  const context = useContext(ServiceContext);

  if (!context) {
    throw new Error('useServices must be used within a ServiceProvider');
  }

  return context;
};

// Service-specific hooks for convenience
export const useClassService = () => {
  const services = useServices();
  return services.class;
};

export const useStudentService = () => {
  const services = useServices();
  return services.student;
};

export const useBusStopService = () => {
  const services = useServices();
  return services.busStop;
};

export const useEnrollmentService = () => {
  const services = useServices();
  return services.enrollment;
};

export const useDivisionService = () => {
  const services = useServices();
  return services.division;
};

export const useExamResultService = () => {
  const services = useServices();
  return services.examResult;
};

export const useGuardianService = () => {
  const services = useServices();
  return services.guardian;
};

export const useBusRouteService = () => {
  const services = useServices();
  return services.busRoute;
};

export const useFeeService = () => {
  const services = useServices();
  return services.fee;
};

export const useLocationService = () => {
  const services = useServices();
  return services.location;
};

export const useFeeTypeService = () => {
  const services = useServices();
  return services.feeType;
};

export const useAcademicYearService = () => {
  const services = useServices();
  return services.academicYear;
};

export const useBusService = () => {
  const services = useServices();
  return services.bus;
};

export const usePaymentScheduleService = () => {
  const services = useServices();
  return services.paymentSchedule;
};

export const useTransactionService = () => {
  const services = useServices();
  return services.transaction;
};

export const useStudentWalletService = () => {
  const services = useServices();
  return services.studentWallet;
};

// Export a higher-order component for class components if needed
export const withServices = (Component) => {
  return function WithServicesComponent(props) {
    const services = useServices();
    return <Component {...props} services={services} />;
  };
};