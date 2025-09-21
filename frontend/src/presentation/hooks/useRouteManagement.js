import { useState, useCallback } from 'react';
import { useBusRouteService } from '../../application/hooks/useServices';
import useStudentStore from '../../application/stores/useStudentStore';

export const useRouteManagement = (currentStep, STEPS) => {
  const busRouteService = useBusRouteService();
  const { setLoading } = useStudentStore();
  const [pickupStopRoutes, setPickupStopRoutes] = useState([]);
  const [classCapacityData, setClassCapacityData] = useState(null);

  const fetchPickupRoutes = useCallback(async (pickupStopId) => {
    if (pickupStopId && currentStep === STEPS.ADMINISTRATION) {
      try {
        setLoading(true);
        const result = await busRouteService.findByStop(pickupStopId);
        setPickupStopRoutes(result.data || []);
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
  }, [currentStep, STEPS, setLoading, busRouteService]);

  const fetchRoutesByLocation = useCallback(async (locationId) => {
    if (locationId && currentStep === STEPS.ADMINISTRATION) {
      try {
        console.log('[useRouteManagement] Fetching routes for location:', locationId);
        setLoading(true);
        const result = await busRouteService.findByLocation(locationId);
        console.log('[useRouteManagement] Routes fetched:', result);
        setPickupStopRoutes(result.data || []);
      } catch (error) {
        console.error('[useRouteManagement] Error fetching routes for location:', error);
        setPickupStopRoutes([]);
        throw new Error('Failed to load routes for location.');
      } finally {
        setLoading(false);
      }
    } else {
      setPickupStopRoutes([]);
    }
  }, [currentStep, STEPS, setLoading, busRouteService]);

  return {
    pickupStopRoutes,
    classCapacityData,
    setClassCapacityData,
    fetchPickupRoutes,
    fetchRoutesByLocation,
  };
};
