import React, { useEffect, useState } from 'react';
import { BookOpen, Gauge, Users, Sparkles, Activity, Tag, MapPin, Bus, CheckCircle, AlertTriangle, Info, ChevronRight } from 'lucide-react';
import Alert from '../Alert';
import FormField from '../FormField';
import SideBySideRoutes from '../SideBySideRoutes';
import BusAllocationDebug from '../BusAllocationDebug';

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
  onEnrollStudent,
  onUpdateToWaiting,
  loading = false
}) => {
  // Derive current administration info from selectedStudent if available (must be first)
  const currentAdmin = selectedStudent?.enrollments?.[0]?.administration;
  const currentDivisionName = currentAdmin?.division?.name || null;
  const currentSeat = (currentAdmin?.seat_allocations && currentAdmin.seat_allocations[0]) || null;
  const currentSeatInfo = currentSeat ? {
    seat_number: currentSeat.seat_number,
    bus_number: currentSeat.bus?.bus_number,
    stop_name: currentSeat.pickup_stop?.stop_name,
    pickup_stop_id: currentSeat.pickup_stop?.id,
    pickup_stop_location_id: currentSeat.pickup_stop?.location?.id,
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

    console.log('🎯 LOCATION MATCHING:', {
      stopName,
      matchingLocation,
      locations
    });

    return matchingLocation?.id || null;
  })() : null;

  // Get currently selected division from form or current saved division
  const formSelectedDivisionId = watch('enrollments.0.administration.division');
  // Prioritize user selection (form) over saved data when user has made a selection
  const selectedDivisionId = formSelectedDivisionId || currentAdmin?.division?.id;

  // Calculate if this is a new enrollment or just a division change
  const currentDivisionId = currentAdmin?.division?.id;
  const isNewEnrollment = selectedDivisionId && !currentDivisionId;
  const isDivisionChange = selectedDivisionId && currentDivisionId && String(selectedDivisionId) !== String(currentDivisionId);

  // Handler for division selection
  const handleDivisionSelect = (divisionId, divisionName) => {
    console.log('🎯 DIVISION CLICKED:', { divisionId, divisionName });

    // Use setValue to update the form field
    if (setValue) {
      setValue('enrollments.0.administration.division', String(divisionId));
      console.log('✅ DIVISION SELECTED using setValue:', {
        divisionId: String(divisionId),
        divisionName,
        formFieldUpdated: 'enrollments.0.administration.division'
      });
    } else {
      console.error('❌ setValue not available!');
    }

    // Force a re-render by watching the value change
    const newValue = watch('enrollments.0.administration.division');
    console.log('📊 New form value:', newValue);
  };

  console.log('=== AdministrationStep Debug ===');
  console.log('selectedDivisionId:', selectedDivisionId, typeof selectedDivisionId);
  console.log('classCapacityData.divisions:', classCapacityData?.divisions?.map(d => ({
    id: d.division.id,
    name: d.division.name,
    isSelected: String(selectedDivisionId) === String(d.division.id)
  })));
  console.log('isStudentRejected:', isStudentRejected);
  console.log('🔍 DEBUG: selectedStudent data:', JSON.stringify(selectedStudent, null, 2));
  console.log('🔍 DEBUG: currentAdmin:', JSON.stringify(currentAdmin, null, 2));
  console.log('🔍 DEBUG: currentSeat:', JSON.stringify(currentSeat, null, 2));
  console.log('🔍 DEBUG: currentSeatInfo:', JSON.stringify(currentSeatInfo, null, 2));
  console.log('🔍 DEBUG: selectedPickupLocationId:', selectedPickupLocationId);
  console.log('🔍 DEBUG: locations array:', JSON.stringify(locations, null, 2));

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

  const [expandedSection, setExpandedSection] = useState('all');
  const [animateCards, setAnimateCards] = useState(false);

  useEffect(() => {
    setAnimateCards(true);
  }, []);

  return (
    <div className="space-y-6">
      {/* Enhanced Header with Progress Indicator */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-2xl font-bold flex items-center gap-2">
              <Activity className="h-7 w-7" />
              Administration & Enrollment
            </h4>
            <p className="text-indigo-100 mt-2">
              Configure division assignment and bus allocation for the student
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
                  console.log('🎯 DROPDOWN VALUE CALCULATION:');
                  console.log('  selectedPickupLocationId (form):', selectedPickupLocationId);
                  console.log('  currentSeatInfo?.pickup_stop_location_id:', currentSeatInfo?.pickup_stop_location_id);
                  console.log('  guessedLocationId:', guessedLocationId);

                  // Prioritize user selection over saved data
                  if (selectedPickupLocationId) {
                    const value = String(selectedPickupLocationId);
                    console.log('  Using user selected location:', value);
                    return value;
                  }

                  // Fall back to current saved location
                  if (currentSeatInfo?.pickup_stop_location_id) {
                    const value = String(currentSeatInfo.pickup_stop_location_id);
                    console.log('  Using current seat location:', value);
                    return value;
                  }

                  // Finally try guessed location ID based on name matching
                  if (guessedLocationId) {
                    const value = String(guessedLocationId);
                    console.log('  Using guessed location:', value);
                    return value;
                  }

                  console.log('  Using empty fallback');
                  return '';
                })()}
                onChange={(e) => {
                  console.log('🎯 PICKUP LOCATION CHANGED:', e.target.value);
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

      <SideBySideRoutes
        pickupRoutes={pickupStopRoutes}
        selectedPickupStopId={(() => {
          // Prioritize user selection (form) over saved data
          const formPickupStopId = watch('enrollments.0.administration.seat_allocations.0.pickup_stop');
          return formPickupStopId || currentSeatInfo?.pickup_stop_id || pickupStopId;
        })()}
        currentSeatInfo={currentSeatInfo}
        hasExistingSeat={Boolean(currentSeatInfo)}
        onSelectStop={(stop) => {
          console.log('🎯 BUS STOP CLICKED:', { stopId: stop.id, stopName: stop.stop_name });
          setValue('enrollments.0.administration.seat_allocations.0.pickup_stop', String(stop.id));
        }}
      />

      {classCapacityData?.summary && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-xl">


          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h4 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-indigo-600" />
                Class {classCapacityData.class?.classname} Capacity Overview
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
          {classCapacityData.divisions && classCapacityData.divisions.length > 0 && (
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between mb-6">
                <h5 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Tag className="h-6 w-6 text-indigo-600" />
                  Division Selection
                </h5>
                <span className="text-sm text-gray-500">
                  {classCapacityData.divisions.length} divisions available
                </span>
              </div>
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
                {classCapacityData.divisions.map((div, index) => {
                  const utilizationColor = div.utilizationPercent < 50 ? 'green' :
                                         div.utilizationPercent < 80 ? 'yellow' : 'red';
                  const isSelected = String(selectedDivisionId) === String(div.division.id);
                  const isClickable = !isStudentRejected;

                  // Calculate provisional metrics if this division is selected
                  const currentDivisionId = currentAdmin?.division?.id;
                  const isCurrentDivision = String(currentDivisionId) === String(div.division.id);
                  const isSelectedNewDivision = isSelected && String(currentDivisionId) !== String(div.division.id);

                  // Calculate provisional counts based on whether this is a new assignment or a change
                  let provisionalEnrolled = div.enrolled;
                  if (isSelectedNewDivision) {
                    // User is selecting a new division (different from current)
                    provisionalEnrolled = div.enrolled + 1;
                  } else if (isCurrentDivision && selectedDivisionId && String(selectedDivisionId) !== String(div.division.id)) {
                    // User was in this division but selected a different one
                    provisionalEnrolled = div.enrolled - 1;
                  } else if (isSelected && !currentDivisionId) {
                    // User has no current division and is selecting this one
                    provisionalEnrolled = div.enrolled + 1;
                  }

                  const provisionalAvailable = div.capacity - provisionalEnrolled;
                  const provisionalUtilization = Math.round((provisionalEnrolled / div.capacity) * 100);

                  const provisionalColor = provisionalUtilization < 50 ? 'green' :
                                         provisionalUtilization < 80 ? 'yellow' : 'red';

                  return (
                    <div
                      key={index}
                      onClick={isClickable ? () => handleDivisionSelect(div.division.id, div.division.name) : undefined}
                      className={`
                        relative bg-white rounded-xl p-5 shadow-lg transition-all duration-300 overflow-hidden
                        ${isClickable ? 'cursor-pointer hover:shadow-xl hover:scale-[1.03] hover:-translate-y-1' : 'cursor-default'}
                        ${isSelected
                          ? 'border-2 border-indigo-500 ring-4 ring-indigo-100 bg-gradient-to-br from-indigo-50 to-blue-50'
                          : 'border-2 border-gray-200 hover:border-indigo-400'
                        }
                      `}
                      style={{
                        animation: animateCards ? `fadeIn 0.5s ease-out ${index * 100}ms both` : 'none'
                      }}
                    >
                      {isSelected && (
                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-indigo-400 to-blue-500 transform rotate-45 translate-x-10 -translate-y-10" />
                      )}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                            utilizationColor === 'green' ? 'bg-green-500' :
                            utilizationColor === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
                          }`}>
                            {div.division.name}
                          </div>
                          <div className="ml-3">
                            <h6 className="font-semibold text-gray-900">Division {div.division.name}</h6>
                            {(isSelectedNewDivision || (isCurrentDivision && selectedDivisionId && String(selectedDivisionId) !== String(div.division.id))) ? (
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
                          {isSelected && (
                            <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-xs font-bold rounded-full shadow-lg z-10 relative">
                              <CheckCircle className="h-4 w-4" />
                              SELECTED
                            </div>
                          )}
                          {(isSelectedNewDivision || (isCurrentDivision && selectedDivisionId && String(selectedDivisionId) !== String(div.division.id))) ? (
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
                        {(isSelectedNewDivision || (isCurrentDivision && selectedDivisionId && String(selectedDivisionId) !== String(div.division.id))) && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xs font-bold text-white drop-shadow-lg">
                              {isSelectedNewDivision ? '+1 Student' : isCurrentDivision ? '-1 Student' : ''}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-between items-center text-xs">
                        {(isSelectedNewDivision || (isCurrentDivision && selectedDivisionId && String(selectedDivisionId) !== String(div.division.id))) ? (
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
                          {(isSelectedNewDivision || (isCurrentDivision && selectedDivisionId && String(selectedDivisionId) !== String(div.division.id))) ? (
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
                              {isClickable && !isSelected && (
                                <span className="text-indigo-600 font-medium">👆 Click to select</span>
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
              const hasSelectedStop = pickupStopId;
              const hasDivisionsAvailable = classCapacityData?.divisions && classCapacityData.divisions.length > 0;

              if (hasSelectedDivision && hasSelectedStop) {
                // Both division and stop selected - show enroll button
                return (
                  <button
                    type="button"
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-3"
                    onClick={async () => {
                      if (onEnrollStudent) {
                        await onEnrollStudent({
                          divisionId: selectedDivisionId,
                          pickupStopId: pickupStopId
                        });
                      }
                    }}
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center space-x-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                        </svg>
                        <span>Enrolling Student...</span>
                      </span>
                    ) : (
                      <>
                        <CheckCircle className="h-5 w-5" />
                        <span>Confirm Enrollment</span>
                        <ChevronRight className="h-5 w-5" />
                      </>
                    )}
                  </button>
                );
              } else if (!hasDivisionsAvailable && classCapacityData?.summary) {
                // No divisions available - show waiting status button
                return (
                  <button
                    type="button"
                    className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-3"
                    onClick={async () => {
                      if (onUpdateToWaiting) {
                        await onUpdateToWaiting();
                      }
                    }}
                    disabled={loading}
                  >
                    {loading ? (
                      <span>🔄 Updating...</span>
                    ) : (
                      <>
                        <Clock className="h-5 w-5" />
                        <span>Add to Waiting List</span>
                      </>
                    )}
                  </button>
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
