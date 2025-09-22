import React, { useEffect, useState } from 'react';
import { BookOpen, Gauge, Users, Sparkles, Activity, Tag, MapPin, Bus, CheckCircle, AlertTriangle, Info, ChevronRight, Route, Clock, Shield, Eye } from 'lucide-react';
import Alert from '../Alert';
import FormField from '../FormField';
import BusAllocationDebug from '../BusAllocationDebug';
import RouteVisualization from '../../transport/RouteVisualization';
import { useBusRouteService } from '../../../../application/hooks/useServices';
import { useAuthStore } from '../../../../application/stores/useAuthStore';

const AdministrationStep = ({
  isStudentRejected,
  classCapacityData,
  busStops,
  locations,
  selectedPickupLocationId,
  onPickupLocationChange,
  divisions,
  register,
  errors,
  pickupStopRoutes,
  pickupStopId,
  selectedStudent,
  watch,
  setValue,
  loading = false
}) => {
  // Get user role from auth store
  const { user } = useAuthStore();
  const userRole = user?.role?.type || user?.role?.name || user?.role || 'public';
  const userEmail = user?.email || '';
  const username = user?.username || '';

  // Define roles
  const isPrincipal = ['principal', 'administrator', 'admin'].includes(userRole.toLowerCase()) ||
                      userEmail.includes('principal') || username.includes('principal');
  const isClerk = ['admission-clerk', 'admission_clerk', 'clerk', 'admissions'].includes(userRole.toLowerCase()) ||
                   userEmail.includes('clerk') || username.includes('clerk');
  const isReadOnly = !isPrincipal && !isClerk;

  // Derive current administration info from selectedStudent if available (must be first)
  const currentAdmin = selectedStudent?.enrollments?.[0]?.administration;
  const currentDivisionName = typeof currentAdmin?.division === 'object' && (currentAdmin?.division?.divisionName || currentAdmin?.division?.name)
    ? (currentAdmin.division.divisionName || currentAdmin.division.name)
    : null;
  const currentSeat = (currentAdmin?.seat_allocations && currentAdmin.seat_allocations[0]) || null;
  const currentSeatInfo = currentSeat ? {
    seat_number: currentSeat.seat_number,
    bus_number: currentSeat.bus?.bus_number || currentSeat.bus?.number || currentSeat.bus_number || '1',
    stop_name: currentSeat.pickup_stop?.stop_name,
    pickup_stop_id: currentSeat.pickup_stop?.id,
    pickup_stop_location_id: currentSeat.pickup_stop?.location?.id || currentSeat.pickup_stop?.location,
  } : null;

  // Since location isn't populated in pickup_stop, let's try to match by name
  const guessedLocationId = currentSeat && locations ? (() => {
    const stopName = currentSeat.pickup_stop?.stop_name;
    if (!stopName) return null;

    // Try to find location by matching stop name with location name
    const matchingLocation = locations.find(loc =>
      stopName.toLowerCase().includes(loc.name.toLowerCase()) ||
      loc.name.toLowerCase().includes(stopName.toLowerCase())
    );

    return matchingLocation?.id || null;
  })() : null;

  // Get currently selected division from form or current saved division
  const formSelectedDivisionId = watch('enrollments.0.administration.division');
  // Prioritize user selection (form) over saved data when user has made a selection
  // Ensure we're getting the ID, not the whole object
  const currentDivisionId = typeof currentAdmin?.division === 'object' && currentAdmin?.division?.id
    ? currentAdmin.division.id
    : currentAdmin?.division;
  const selectedDivisionId = formSelectedDivisionId || currentDivisionId;

  // Calculate if this is a new enrollment or just a division change
  const isNewEnrollment = selectedDivisionId && !currentDivisionId;
  const isDivisionChange = selectedDivisionId && currentDivisionId && String(selectedDivisionId) !== String(currentDivisionId);

  // Handler for division selection
  const handleDivisionSelect = (divisionId, divisionName) => {

    // Use setValue to update the form field
    if (setValue) {
      const divisionIdString = String(divisionId);
      setValue('enrollments.0.administration.division', divisionIdString);

      // Force form to update immediately
      setTimeout(() => {
        const updatedValue = watch('enrollments.0.administration.division');
        console.log('✅ DIVISION SELECTED - Verification:', {
          set: divisionIdString,
          current: updatedValue,
          matches: divisionIdString === updatedValue,
          divisionName,
          formFieldUpdated: 'enrollments.0.administration.division'
        });
      }, 0);
    } else {
      console.error('❌ setValue not available!');
    }

    // Force a re-render by watching the value change
    const newValue = watch('enrollments.0.administration.division');
  };


  // Sync current administration data to form when component loads (only if form is empty)
  useEffect(() => {
    // Only set initial values if form doesn't have any user selections
    const currentFormDivision = watch('enrollments.0.administration.division');
    const currentFormPickupStop = watch('enrollments.0.administration.seat_allocations.0.pickup_stop');

    // Only populate if we have saved data AND no form data
    if (currentAdmin?.division?.id && !currentFormDivision) {
      console.log('Setting initial division from saved data:', currentAdmin.division.id);
      setValue('enrollments.0.administration.division', String(currentAdmin.division.id));
    }

    if (currentSeatInfo?.pickup_stop_id && !currentFormPickupStop) {
      console.log('Setting initial pickup stop from saved data:', currentSeatInfo.pickup_stop_id);
      setValue('enrollments.0.administration.seat_allocations.0.pickup_stop', String(currentSeatInfo.pickup_stop_id));
    }

    if (currentSeatInfo?.pickup_stop_location_id && !selectedPickupLocationId) {
      console.log('Setting initial pickup location from saved data:', currentSeatInfo.pickup_stop_location_id);
      onPickupLocationChange?.(String(currentSeatInfo.pickup_stop_location_id));
    }
  }, [currentAdmin?.division?.id, currentSeatInfo?.pickup_stop_id, currentSeatInfo?.pickup_stop_location_id]); // Only depend on the saved data IDs

  const busRouteService = useBusRouteService();
  const [expandedSection, setExpandedSection] = useState('all');
  const [animateCards, setAnimateCards] = useState(false);
  const [availableRoutes, setAvailableRoutes] = useState([]);
  const [loadingRoutes, setLoadingRoutes] = useState(false);
  const [selectedRouteForViewing, setSelectedRouteForViewing] = useState(null);

  useEffect(() => {
    setAnimateCards(true);
  }, []);

  // Fetch bus routes when a pickup location is selected
  useEffect(() => {
    const fetchRoutesForLocation = async () => {
      if (!selectedPickupLocationId) {
        setAvailableRoutes([]);
        setSelectedRouteForViewing(null);
        return;
      }

      console.log('Fetching routes for location ID:', selectedPickupLocationId);
      setLoadingRoutes(true);
      try {
        const result = await busRouteService.findByLocation(selectedPickupLocationId);
        const routes = result.data || [];
        console.log('Routes found:', routes);
        setAvailableRoutes(routes);
        // Auto-select first route if available
        if (routes.length > 0) {
          setSelectedRouteForViewing(routes[0]);
        }
      } catch (error) {
        console.error('Error fetching routes for location:', error);
        setAvailableRoutes([]);
      } finally {
        setLoadingRoutes(false);
      }
    };

    fetchRoutesForLocation();
  }, [selectedPickupLocationId]);

  return (
    <div className="space-y-6">
      {/* Enhanced Header with Progress Indicator */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-2xl font-bold flex items-center gap-2">
              {isPrincipal ? (
                <Shield className="h-7 w-7" />
              ) : isClerk ? (
                <Activity className="h-7 w-7" />
              ) : (
                <Eye className="h-7 w-7" />
              )}
              Administration & Enrollment
            </h4>
            <p className="text-indigo-100 mt-2">
              {isPrincipal ? (
                'Review and approve division assignments and bus allocations'
              ) : isClerk ? (
                'Configure division assignment and bus allocation for the student'
              ) : (
                'View student administration details (read-only)'
              )}
            </p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
            <p className="text-sm font-medium">Step 4 of 5</p>
            <div className="w-32 bg-white/30 rounded-full h-2 mt-1">
              <div className="bg-white h-2 rounded-full" style={{ width: '80%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Note: Enrollment actions are handled in the Exam Results step for better UX flow */}

      {(currentDivisionName || currentSeatInfo) && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-indigo-300 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Info className="h-5 w-5 text-indigo-600" />
                <p className="text-lg font-semibold text-indigo-900">Current Enrollment Status</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 bg-white rounded-lg px-4 py-3 shadow-sm">
                  <div className="bg-indigo-100 rounded-full p-2">
                    <Tag className="h-4 w-4 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Division</p>
                    <p className="text-sm font-bold text-gray-900">
                      {currentDivisionName || 'Not Assigned'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white rounded-lg px-4 py-3 shadow-sm">
                  <div className="bg-blue-100 rounded-full p-2">
                    <Bus className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Transport</p>
                    <p className="text-sm font-bold text-gray-900">
                      {currentSeatInfo ? `Bus ${currentSeatInfo.bus_number} · Seat ${currentSeatInfo.seat_number}` : 'Not Allocated'}
                    </p>
                    {currentSeatInfo?.stop_name && (
                      <p className="text-xs text-gray-600">{currentSeatInfo.stop_name}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isStudentRejected && (
        <Alert type="error" message="This student has been rejected. The workflow has ended." />
      )}



      {/* Bus Allocation Section with Better Visual Design */}
      {!isStudentRejected && (
        <section className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-xl">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
            <h4 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Bus className="h-6 w-6 text-blue-600" />
              Transport Allocation
            </h4>
            <p className="text-sm text-gray-600 mt-1">Select pickup location for bus route assignment</p>
          </div>
          <div className="p-6">
          <div className="grid grid-cols-1 gap-6">
            {/* Enhanced Pickup Location Selection */}
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-indigo-600" />
                Select Pickup Location
              </label>
              <select
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white hover:border-indigo-400"
                value={(() => {
                  // Prioritize user selection over saved data
                  if (selectedPickupLocationId) {
                    return String(selectedPickupLocationId);
                  }

                  // Fall back to current saved location (could be directly from pickup_stop.location or guessed)
                  const savedLocationId = currentSeatInfo?.pickup_stop_location_id || guessedLocationId;
                  if (savedLocationId) {
                    return String(savedLocationId);
                  }

                  return '';
                })()}
                onChange={(e) => {
                  onPickupLocationChange?.(e.target.value);
                }}
              >
                <option value="">Select Pickup Location</option>
                {locations?.map(loc => (
                  <option key={loc.id} value={String(loc.id)}>
                    {loc.name}
                    {(currentSeatInfo?.pickup_stop_location_id === loc.id || guessedLocationId === loc.id) && ' (Current)'}
                  </option>
                ))}
              </select>
              {currentSeatInfo && (
                <p className="text-xs text-indigo-600 mt-1">
                  Currently allocated: {currentSeatInfo.stop_name}
                </p>
              )}
            </div>

            {/* Pickup Stop dropdown removed as per requirement */}
          </div>
          </div>
        </section>
      )}

      {/* Bus Routes Section - Simplified */}
      {(() => {
        // Determine which routes to use - prefer pickupStopRoutes over availableRoutes
        const routesToDisplay = pickupStopRoutes && pickupStopRoutes.length > 0
          ? pickupStopRoutes
          : availableRoutes;

        console.log('[AdministrationStep] Routes to display:', {
          pickupStopRoutesCount: pickupStopRoutes?.length,
          availableRoutesCount: availableRoutes?.length,
          routesToDisplayCount: routesToDisplay?.length,
          firstRoute: routesToDisplay?.[0],
          routesToDisplay
        });

        const hasRoutes = routesToDisplay && routesToDisplay.length > 0;

        if (!hasRoutes && !loadingRoutes) {
          return (
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Bus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No bus routes available</p>
              <p className="text-sm text-gray-500 mt-2">Please select a location to see available routes</p>
            </div>
          );
        }

        return (
          <section className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Route className="h-6 w-6 text-indigo-600" />
                Available Bus Routes
              </h3>
              {!loadingRoutes && (
                <span className="text-sm text-gray-500">
                  {routesToDisplay.length} route{routesToDisplay.length !== 1 ? 's' : ''} available
                </span>
              )}
            </div>

            {loadingRoutes ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : (
              <>
                {/* Instructions */}
                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <Info className="inline h-4 w-4 mr-1" />
                    Click on any bus stop below to select it as the pickup location for this student
                  </p>
                </div>

                {/* Routes display */}
                <div className="space-y-6">
                  {routesToDisplay.map(route => (
                    <RouteVisualization
                      key={`route-${route.id}`}
                      route={route}
                      selectedStopId={(() => {
                        const formPickupStopId = watch('enrollments.0.administration.seat_allocations.0.pickup_stop');
                        return formPickupStopId || currentSeatInfo?.pickup_stop_id || pickupStopId;
                      })()}
                      routeType="pickup"
                      onSelectStop={(stop) => {
                        console.log('🎯 BUS STOP CLICKED - Full stop object:', stop);
                        console.log('🎯 BUS STOP CLICKED - Details:', {
                          stopId: stop.id,
                          stopName: stop.stop_name,
                          route: route.route_name,
                          routeId: route.id
                        });

                        if (!stop.id) {
                          console.error('❌ Stop has no ID!', stop);
                          return;
                        }

                        // Set the pickup stop value
                        const stopIdStr = String(stop.id);
                        console.log('📝 Setting pickup stop to:', stopIdStr);
                        setValue('enrollments.0.administration.seat_allocations.0.pickup_stop', stopIdStr);

                        // Also store the route information if needed
                        const routeIdStr = String(route.id);
                        console.log('📝 Setting bus route to:', routeIdStr);
                        setValue('enrollments.0.administration.seat_allocations.0.bus_route', routeIdStr);

                        // Verify the values were set
                        setTimeout(() => {
                          const currentPickupStop = watch('enrollments.0.administration.seat_allocations.0.pickup_stop');
                          const currentBusRoute = watch('enrollments.0.administration.seat_allocations.0.bus_route');
                          console.log('✅ Values after setting:', {
                            pickup_stop: currentPickupStop,
                            bus_route: currentBusRoute
                          });
                        }, 100);

                        console.log(`✅ Pickup stop selected: ${stop.stop_name} on route ${route.route_name}`);
                      }}
                    />
                  ))}
                </div>

                {/* Show selected stop confirmation */}
                {(() => {
                  const formPickupStopId = watch('enrollments.0.administration.seat_allocations.0.pickup_stop');
                  console.log('📍 Current form pickup stop ID:', formPickupStopId);

                  if (formPickupStopId) {
                    // Find the selected stop from routes
                    let selectedStop = null;
                    let selectedRoute = null;

                    for (const route of routesToDisplay) {
                      const stops = route?.stop_schedules?.length > 0
                        ? route.stop_schedules.map(s => {
                            const busStop = s.bus_stop || s.busStop || {};
                            return {
                              ...busStop,
                              id: busStop.id || busStop.documentId || s.bus_stop_id,
                              stop_name: busStop.stop_name || busStop.stopName || busStop.name
                            };
                          })
                        : route?.bus_stops || [];

                      selectedStop = stops.find(s => {
                        const match = String(s.id) === String(formPickupStopId);
                        if (match) {
                          console.log('✅ Found matching stop:', s);
                        }
                        return match;
                      });

                      if (selectedStop) {
                        selectedRoute = route;
                        break;
                      }
                    }

                    if (selectedStop) {
                      return (
                        <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                          <p className="text-sm text-green-800">
                            <CheckCircle className="inline h-4 w-4 mr-1" />
                            Selected pickup stop: <strong>{selectedStop.stop_name}</strong>
                            {selectedRoute && ` on ${selectedRoute.route_name}`}
                          </p>
                        </div>
                      );
                    }
                  }
                  return null;
                })()}
              </>
            )}
          </section>
        );
      })()}

      {classCapacityData?.summary && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-xl">


          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h4 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-indigo-600" />
                Class {classCapacityData.class?.classname || classCapacityData.class?.className || classCapacityData.className || `ID: ${classCapacityData.classId || ''}`} Capacity Overview
              </h4>
              <div className={`px-5 py-2 rounded-full text-sm font-bold shadow-sm ${
              classCapacityData.summary.overallUtilization < 50
                ? 'bg-gradient-to-r from-green-400 to-green-500 text-white'
                : classCapacityData.summary.overallUtilization < 80
                ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white'
                : 'bg-gradient-to-r from-red-400 to-red-500 text-white'
            } animate-pulse`}>
              <Activity className="h-4 w-4 inline mr-1" />
              {classCapacityData.summary.overallUtilization}% Utilized
            </div>
            </div>
          </div>

          <div className="p-6">
          {/* Enhanced Visual Progress Bar */}
          <div className="mb-8">
            {(() => {
              // Only increase total if it's a new enrollment, not a division change
              const newTotalEnrolled = isNewEnrollment ? classCapacityData.summary.totalEnrolled + 1 : classCapacityData.summary.totalEnrolled;
              const newOverallUtilization = isNewEnrollment ? Math.round((newTotalEnrolled / classCapacityData.summary.totalCapacity) * 100) : classCapacityData.summary.overallUtilization;
              const showProvisional = isNewEnrollment;

              return (
                <>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Overall Utilization</span>
                    <div className="flex items-center gap-2">
                      {showProvisional && (
                        <span className="text-xs text-gray-400 line-through">{classCapacityData.summary.totalEnrolled} / {classCapacityData.summary.totalCapacity}</span>
                      )}
                      <span className={`text-sm ${showProvisional ? 'text-blue-800 font-bold' : 'text-blue-600'}`}>
                        {newTotalEnrolled} / {classCapacityData.summary.totalCapacity} seats
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 relative overflow-hidden">
                    {/* Current utilization bar */}
                    {showProvisional && (
                      <div
                        className="h-full rounded-full transition-all duration-300 bg-gray-300 opacity-50"
                        style={{ width: `${classCapacityData.summary.overallUtilization}%` }}
                      />
                    )}
                    {/* New/Provisional utilization bar */}
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${showProvisional ? 'absolute inset-0' : ''} ${
                        newOverallUtilization < 50
                          ? 'bg-gradient-to-r from-green-400 to-green-500'
                          : newOverallUtilization < 80
                          ? 'bg-gradient-to-r from-yellow-400 to-orange-500'
                          : 'bg-gradient-to-r from-red-400 to-red-500'
                      }`}
                      style={{ width: `${newOverallUtilization}%` }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-bold text-white drop-shadow-sm">
                        {showProvisional && (
                          <span className="text-gray-200 mr-1 line-through">{classCapacityData.summary.overallUtilization}%</span>
                        )}
                        {newOverallUtilization}%
                        {showProvisional && (
                          <span className="ml-1 text-yellow-200">+{newOverallUtilization - classCapacityData.summary.overallUtilization}%</span>
                        )}
                      </span>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>

          {/* Enhanced Key Metrics Cards with Animations */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className={`bg-gradient-to-br from-indigo-50 to-white rounded-xl p-5 shadow-lg border-2 border-indigo-200 hover:scale-105 transition-all duration-300 ${animateCards ? 'animate-in fade-in slide-in-from-bottom-2' : ''}`} style={{animationDelay: '0ms'}}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Total Capacity</p>
                  <p className="text-2xl font-bold text-indigo-900">{classCapacityData.summary.totalCapacity}</p>
                </div>
                <div className="bg-indigo-100 rounded-full p-2">
                  <Gauge className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
            </div>

            <div className={`bg-gradient-to-br from-green-50 to-white rounded-xl p-5 shadow-lg border-2 border-green-200 hover:scale-105 transition-all duration-300 ${animateCards ? 'animate-in fade-in slide-in-from-bottom-2' : ''}`} style={{animationDelay: '100ms'}}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Enrolled</p>
                  {isNewEnrollment ? (
                    <div className="flex items-center gap-2">
                      <p className="text-lg text-gray-400 line-through">{classCapacityData.summary.totalEnrolled}</p>
                      <p className="text-2xl font-bold text-green-700">{classCapacityData.summary.totalEnrolled + 1}</p>
                    </div>
                  ) : (
                    <p className="text-2xl font-bold text-green-700">{classCapacityData.summary.totalEnrolled}</p>
                  )}
                </div>
                <div className="bg-green-100 rounded-full p-2">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className={`bg-gradient-to-br from-blue-50 to-white rounded-xl p-5 shadow-lg border-2 border-blue-200 hover:scale-105 transition-all duration-300 ${animateCards ? 'animate-in fade-in slide-in-from-bottom-2' : ''}`} style={{animationDelay: '200ms'}}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Available</p>
                  {isNewEnrollment ? (
                    <div className="flex items-center gap-2">
                      <p className="text-lg text-gray-400 line-through">{classCapacityData.summary.totalAvailable}</p>
                      <p className="text-2xl font-bold text-blue-700">{classCapacityData.summary.totalAvailable - 1}</p>
                    </div>
                  ) : (
                    <p className="text-2xl font-bold text-blue-700">{classCapacityData.summary.totalAvailable}</p>
                  )}
                </div>
                <div className="bg-blue-100 rounded-full p-2">
                  <Sparkles className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className={`bg-gradient-to-br from-purple-50 to-white rounded-xl p-5 shadow-lg border-2 border-purple-200 hover:scale-105 transition-all duration-300 ${animateCards ? 'animate-in fade-in slide-in-from-bottom-2' : ''}`} style={{animationDelay: '300ms'}}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Utilization</p>
                  {isNewEnrollment ? (
                    (() => {
                      const newTotalEnrolled = classCapacityData.summary.totalEnrolled + 1;
                      const newOverallUtilization = Math.round((newTotalEnrolled / classCapacityData.summary.totalCapacity) * 100);
                      return (
                        <div className="flex items-center gap-2">
                          <p className="text-lg text-gray-400 line-through">{classCapacityData.summary.overallUtilization}%</p>
                          <p className="text-2xl font-bold text-purple-700">{newOverallUtilization}%</p>
                        </div>
                      );
                    })()
                  ) : (
                    <p className="text-2xl font-bold text-purple-700">{classCapacityData.summary.overallUtilization}%</p>
                  )}
                </div>
                <div className="bg-purple-100 rounded-full p-2">
                  <Activity className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Division Selection Section */}
          {((classCapacityData?.divisions && classCapacityData.divisions.length > 0) || (divisions && divisions.length > 0)) && (
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h5 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Tag className="h-6 w-6 text-indigo-600" />
                  Division Selection
                </h5>
                <span className="text-sm text-gray-500">
                  {(classCapacityData?.divisions || divisions || []).length} divisions available
                </span>
              </div>

              {/* Current Selection Status */}
              {selectedDivisionId && (
                <div className="mb-4 p-3 bg-indigo-50 border-2 border-indigo-300 rounded-lg flex items-center justify-between animate-in fade-in slide-in-from-top-1 duration-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-indigo-600" />
                    <span className="text-sm font-medium text-indigo-900">
                      Division <strong>{(classCapacityData?.divisions || divisions || []).find(d => String(d.id) === String(selectedDivisionId))?.divisionName ||
                                      (classCapacityData?.divisions || divisions || []).find(d => String(d.id) === String(selectedDivisionId))?.name ||
                                      `ID: ${selectedDivisionId}`}</strong> selected
                    </span>
                  </div>
                  {formSelectedDivisionId && String(formSelectedDivisionId) !== String(currentAdmin?.division?.id) && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-semibold">
                      Changed
                    </span>
                  )}
                </div>
              )}
              {!isStudentRejected && (
                <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-indigo-500 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Info className="h-5 w-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-700">
                      <strong className="text-indigo-900">Select your preferred division</strong> by clicking on a card below.
                      The administration will review and confirm your selection based on availability.
                    </p>
                  </div>
                </div>
              )}
              <div className="grid gap-4 md:grid-cols-2">
                {(classCapacityData?.divisions || divisions || []).map((div, index) => {
                  // Handle both simple division objects and nested structures
                  const divisionId = div.id;
                  const divisionName = div.divisionName || div.name;
                  const enrolled = div.enrolled || 0;
                  const capacity = div.capacity || div.max_capacity || 30; // Default capacity if not provided
                  const utilizationPercent = div.utilizationPercent || (capacity > 0 ? Math.round((enrolled / capacity) * 100) : 0);

                  const utilizationColor = utilizationPercent < 50 ? 'green' :
                                         utilizationPercent < 80 ? 'yellow' : 'red';
                  const isSelected = selectedDivisionId && String(selectedDivisionId) === String(divisionId);
                  const isClickable = !isStudentRejected;

                  // Calculate provisional metrics if this division is selected
                  const currentDivisionId = currentAdmin?.division?.id;
                  const isCurrentDivision = String(currentDivisionId) === String(divisionId);
                  const isSelectedNewDivision = isSelected && String(currentDivisionId) !== String(divisionId);

                  // Calculate provisional counts based on whether this is a new assignment or a change
                  let provisionalEnrolled = enrolled;
                  if (isSelectedNewDivision) {
                    // User is selecting a new division (different from current)
                    provisionalEnrolled = enrolled + 1;
                  } else if (isCurrentDivision && selectedDivisionId && String(selectedDivisionId) !== String(divisionId)) {
                    // User was in this division but selected a different one
                    provisionalEnrolled = enrolled - 1;
                  } else if (isSelected && !currentDivisionId) {
                    // User has no current division and is selecting this one
                    provisionalEnrolled = enrolled + 1;
                  }

                  const provisionalAvailable = capacity - provisionalEnrolled;
                  const provisionalUtilization = Math.round((provisionalEnrolled / capacity) * 100);

                  const provisionalColor = provisionalUtilization < 50 ? 'green' :
                                         provisionalUtilization < 80 ? 'yellow' : 'red';

                  return (
                    <div
                      key={index}
                      onClick={isClickable ? () => handleDivisionSelect(divisionId, divisionName) : undefined}
                      className={`
                        relative bg-white rounded-xl p-5 shadow-lg transition-all duration-300 overflow-hidden
                        ${isClickable ? 'cursor-pointer hover:shadow-xl hover:scale-[1.03] hover:-translate-y-1' : 'cursor-default'}
                        ${isSelected
                          ? 'border-4 border-indigo-500 ring-4 ring-indigo-200 bg-gradient-to-br from-indigo-50 via-blue-50 to-indigo-50 transform scale-[1.02]'
                          : isCurrentDivision
                          ? 'border-2 border-blue-300 bg-blue-50'
                          : 'border-2 border-gray-200 hover:border-indigo-400'
                        }
                      `}
                      style={{
                        animation: animateCards ? `fadeIn 0.5s ease-out ${index * 100}ms both` : 'none'
                      }}
                    >
                      {isSelected && (
                        <>
                          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-indigo-400 to-blue-500 transform rotate-45 translate-x-10 -translate-y-10" />
                          <div className="absolute top-2 right-2 z-10">
                            <CheckCircle className="h-6 w-6 text-indigo-600 bg-white rounded-full" />
                          </div>
                        </>
                      )}
                      {isCurrentDivision && !isSelected && (
                        <div className="absolute top-2 right-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                          Current
                        </div>
                      )}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                            isSelected ? 'bg-gradient-to-br from-indigo-500 to-blue-600 ring-2 ring-indigo-300' :
                            utilizationColor === 'green' ? 'bg-green-500' :
                            utilizationColor === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
                          }`}>
                            {div.divisionName || div.name}
                          </div>
                          <div className="ml-3">
                            <h6 className={`font-semibold ${
                              isCurrentDivision ? 'text-green-800' :
                              isSelected ? 'text-indigo-900' : 'text-gray-900'
                            }`}>
                              Division {div.divisionName || div.name}
                            </h6>
                            {isSelectedNewDivision ? (
                              <div>
                                <p className="text-sm text-gray-500 line-through">{div.enrolled} of {div.capacity} students</p>
                                <p className="text-sm font-medium text-indigo-700">
                                  📈 After placement: {provisionalEnrolled} of {div.capacity} students
                                </p>
                              </div>
                            ) : (
                              <p className="text-sm text-gray-600">{provisionalEnrolled} of {div.capacity} students</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {isCurrentDivision ? (
                            <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                              <CheckCircle className="h-3 w-3" />
                              CURRENT
                            </div>
                          ) : isSelected ? (
                            <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-xs font-bold rounded-full shadow-lg z-10 relative animate-pulse">
                              <CheckCircle className="h-4 w-4" />
                              SELECTED
                            </div>
                          ) : null}
                          {(isSelectedNewDivision || (isCurrentDivision && selectedDivisionId && String(selectedDivisionId) !== String(div.id))) ? (
                            <div className="flex flex-col items-end gap-1">
                              <div className={`px-2 py-1 rounded text-xs line-through ${
                                utilizationColor === 'green' ? 'bg-green-50 text-green-600' :
                                utilizationColor === 'yellow' ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-600'
                              }`}>
                                {div.utilizationPercent}%
                              </div>
                              <div className={`px-3 py-1 rounded-full text-sm font-bold border-2 ${
                                provisionalColor === 'green' ? 'bg-green-100 text-green-800 border-green-400' :
                                provisionalColor === 'yellow' ? 'bg-yellow-100 text-yellow-800 border-yellow-400' :
                                'bg-red-100 text-red-800 border-red-400'
                              }`}>
                                {provisionalUtilization}%
                              </div>
                            </div>
                          ) : (
                            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                              provisionalColor === 'green' ? 'bg-green-100 text-green-800' :
                              provisionalColor === 'yellow' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {provisionalUtilization}%
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Division progress bar */}
                      <div className="w-full bg-gray-200 rounded-full h-3 mb-2 relative">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            provisionalColor === 'green' ? 'bg-green-400' :
                            provisionalColor === 'yellow' ? 'bg-yellow-400' : 'bg-red-400'
                          }`}
                          style={{ width: `${provisionalUtilization}%` }}
                        />
                        {isSelectedNewDivision && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xs font-bold text-white drop-shadow-lg">
                              {isSelectedNewDivision ? '+1 Student' : isCurrentDivision ? '-1 Student' : ''}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-between items-center text-xs">
                        {(isSelectedNewDivision || (isCurrentDivision && selectedDivisionId && String(selectedDivisionId) !== String(div.id))) ? (
                          <div className="flex flex-col">
                            <span className="text-gray-400 line-through">{div.available} seats available</span>
                            <span className={`font-medium ${provisionalAvailable <= 0 ? 'text-red-600' : 'text-indigo-600'}`}>
                              📊 After: {provisionalAvailable} seats available
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-600">{provisionalAvailable} seats available</span>
                        )}
                        <div className="flex items-center gap-2">
                          {(isSelectedNewDivision || (isCurrentDivision && selectedDivisionId && String(selectedDivisionId) !== String(div.id))) ? (
                            <div className="flex flex-col items-end">
                              <span className="text-gray-400 line-through">
                                {div.utilizationPercent < 50 ? 'Low' : div.utilizationPercent < 80 ? 'Moderate' : 'High'} utilization
                              </span>
                              <span className={`font-medium ${
                                provisionalUtilization < 50 ? 'text-green-600' :
                                provisionalUtilization < 80 ? 'text-yellow-600' : 'text-red-600'
                              }`}>
                                📈 {provisionalUtilization < 50 ? 'Low' : provisionalUtilization < 80 ? 'Moderate' : 'High'} utilization
                              </span>
                            </div>
                          ) : (
                            <>
                              <span className="text-gray-600">
                                {provisionalUtilization < 50 ? 'Low' : provisionalUtilization < 80 ? 'Moderate' : 'High'} utilization
                              </span>
                              {isClickable && !isSelected && !isCurrentDivision && (
                                <span className="text-indigo-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">👆 Click to select</span>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Enhanced Action Buttons Section */}
          <div className="mt-8 pt-6 border-t-2 border-gray-200 bg-gradient-to-r from-gray-50 to-white rounded-lg p-6">
            {(() => {
              const hasSelectedDivision = selectedDivisionId;
              // Check for pickup stop from multiple sources: prop, form value, or current saved data
              const formPickupStop = watch('enrollments.0.administration.seat_allocations.0.pickup_stop');
              const hasSelectedStop = pickupStopId || formPickupStop || currentSeatInfo?.pickup_stop_id;
              const hasDivisionsAvailable = classCapacityData?.divisions && classCapacityData.divisions.length > 0;

              if (hasSelectedDivision && hasSelectedStop) {
                // Both division and stop selected - show ready status
                return (
                  <div className="w-full bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 py-4 px-6 rounded-xl flex items-center justify-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-green-800 font-medium">Division and bus allocation configured</span>
                  </div>
                );
              } else if (!hasDivisionsAvailable && classCapacityData?.summary) {
                // No divisions available - show waiting status message
                return (
                  <div className="w-full bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-400 py-4 px-6 rounded-xl flex items-center justify-center gap-3">
                    <Clock className="h-5 w-5 text-yellow-600" />
                    <span className="text-yellow-800 font-medium">No divisions available - Class is at full capacity</span>
                  </div>
                );
              } else {
                // Incomplete selection - show what's missing
                const missing = [];
                if (!hasSelectedDivision) missing.push('division');
                if (!hasSelectedStop) missing.push('bus stop');

                return (
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-4 text-amber-600">
                      <AlertTriangle className="h-5 w-5" />
                      <p className="text-sm font-medium">
                        Please select {missing.join(' and ')} to continue
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled
                      className="w-full bg-gray-200 text-gray-400 font-semibold py-4 px-6 rounded-xl border-2 border-gray-300 border-dashed cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <AlertTriangle className="h-5 w-5" />
                      Complete Selection Required
                    </button>
                  </div>
                );
              }
            })()}
          </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdministrationStep;
