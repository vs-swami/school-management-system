import React, { useEffect } from 'react';
import { BookOpen, Gauge, Users, Sparkles, Activity, Tag } from 'lucide-react';
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

  return (
    <div className="space-y-6">
      <h4 className="text-md font-semibold text-gray-800 mb-4">Administration Details</h4>
      <p className="text-gray-600">This section is for administration-related information.</p>

      {(currentDivisionName || currentSeatInfo) && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-sm text-indigo-900 font-semibold">Current Administration</p>
              <div className="mt-1 text-sm text-indigo-800">
                <span className="mr-4">
                  Division: {currentDivisionName || 'Not set'}
                </span>
                <span>
                  Seat: {currentSeatInfo ? `Bus ${currentSeatInfo.bus_number || 'N/A'} · Seat ${currentSeatInfo.seat_number} · ${currentSeatInfo.stop_name || ''}` : 'Not allocated'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {isStudentRejected && (
        <Alert type="error" message="This student has been rejected. The workflow has ended." />
      )}



      {/* Bus Allocation */}
      {!isStudentRejected && (
        <section className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <Activity className="h-5 w-5 mr-2 text-blue-600" />
            Bus Allocation
          </h4>
          <div className="grid grid-cols-1 gap-6">
            {/* Pickup Location (cascading parent) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                Pickup Location
              </label>
              <select
                className="input"
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
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">


          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-bold text-gray-800 flex items-center">
              <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
              Class Capacity: {classCapacityData.class?.classname}
            </h4>
            <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
              classCapacityData.summary.overallUtilization < 50
                ? 'bg-green-100 text-green-800'
                : classCapacityData.summary.overallUtilization < 80
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {classCapacityData.summary.overallUtilization}% Utilized
            </div>
          </div>

          {/* Visual Progress Bar */}
          <div className="mb-6">
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

          {/* Key Metrics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 shadow-md border border-indigo-100">
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

            <div className="bg-white rounded-lg p-4 shadow-md border border-green-100">
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

            <div className="bg-white rounded-lg p-4 shadow-md border border-blue-100">
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

            <div className="bg-white rounded-lg p-4 shadow-md border border-purple-100">
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

          {/* Division Breakdown */}
          {classCapacityData.divisions && classCapacityData.divisions.length > 0 && (
            <div>
              <h5 className="text-lg font-bold text-indigo-800 mb-4 flex items-center">
                <Tag className="h-5 w-5 mr-2" />
                Division Selection & Breakdown
              </h5>
              {!isStudentRejected && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>💡 Click on a division card below</strong> to select your preferred division. The admin will review your choice and make the final assignment based on availability.
                  </p>
                </div>
              )}
              <div className="grid gap-4">
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
                        bg-white rounded-lg p-4 shadow-md transition-all duration-200
                        ${isClickable ? 'cursor-pointer hover:shadow-lg hover:scale-[1.02]' : 'cursor-default'}
                        ${isSelected
                          ? 'border-2 border-indigo-500 ring-2 ring-indigo-200 bg-indigo-50'
                          : 'border border-gray-200 hover:border-indigo-300'
                        }
                      `}
                    >
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
                            <div className="px-2 py-1 bg-indigo-600 text-white text-xs font-semibold rounded-full">
                              ✓ SELECTED
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

          {/* Action Buttons */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            {(() => {
              const hasSelectedDivision = selectedDivisionId;
              const hasSelectedStop = pickupStopId;
              const hasDivisionsAvailable = classCapacityData?.divisions && classCapacityData.divisions.length > 0;

              if (hasSelectedDivision && hasSelectedStop) {
                // Both division and stop selected - show enroll button
                return (
                  <button
                    type="button"
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
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
                      <span>✅ Enroll Student</span>
                    )}
                  </button>
                );
              } else if (!hasDivisionsAvailable && classCapacityData?.summary) {
                // No divisions available - show waiting status button
                return (
                  <button
                    type="button"
                    className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
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
                      <span>⏳ Update Status to Waiting</span>
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
                    <p className="text-sm text-gray-600 mb-3">
                      Please select {missing.join(' and ')} to continue enrollment
                    </p>
                    <button
                      type="button"
                      disabled
                      className="w-full bg-gray-300 text-gray-500 font-semibold py-3 px-6 rounded-lg cursor-not-allowed"
                    >
                      Complete Selection to Enroll
                    </button>
                  </div>
                );
              }
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdministrationStep;
