import { useState, useCallback } from 'react';
import { BusRouteRepository } from '../../data/repositories/BusRouteRepository';
import useStudentStore from '../../application/stores/useStudentStore';

export const useRouteManagement = (currentStep, STEPS) => {
  const { setLoading } = useStudentStore();
  const [pickupStopRoutes, setPickupStopRoutes] = useState([]);
  const [classCapacityData, setClassCapacityData] = useState(null);

  const fetchPickupRoutes = useCallback(async (pickupStopId) => {
    if (pickupStopId && currentStep === STEPS.ADMINISTRATION) {
      try {
        setLoading(true);
        const routes = await BusRouteRepository.findByStop(pickupStopId);
        setPickupStopRoutes(routes || []);
      } catch (error) {
        console.error('Error fetching routes for pickup stop:', error);
        setPickupStopRoutes([]);
        throw new Error('Failed to load routes for pickup stop.');
      } finally {
        setLoading(false);
      }
    } else {
      setPickupStopRoutes([]);
    }
  }, [currentStep, STEPS, setLoading]);

  const fetchRoutesByLocation = useCallback(async (locationId) => {
    if (locationId && currentStep === STEPS.ADMINISTRATION) {
      try {
        setLoading(true);
        const routes = await BusRouteRepository.findByLocation(locationId);
        setPickupStopRoutes(routes || []);
      } catch (error) {
        console.error('Error fetching routes for location:', error);
        setPickupStopRoutes([]);
        throw new Error('Failed to load routes for location.');
      } finally {
        setLoading(false);
      }
    } else {
      setPickupStopRoutes([]);
    }
  }, [currentStep, STEPS, setLoading]);

  return {
    pickupStopRoutes,
    classCapacityData,
    setClassCapacityData,
    fetchPickupRoutes,
    fetchRoutesByLocation,
  };
};
