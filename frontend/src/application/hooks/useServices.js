import { useContext } from 'react';
import { ServiceContext } from '../contexts/ServiceContext';

export const useServices = () => {
  const context = useContext(ServiceContext);
  if (!context) {
    throw new Error('useServices must be used within ServiceProvider');
  }
  return context;
};

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

export const useBusRouteService = () => {
  const services = useServices();
  return services.busRoute;
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