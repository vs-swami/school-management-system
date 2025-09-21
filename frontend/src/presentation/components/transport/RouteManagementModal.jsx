import React, { useState, useEffect } from 'react';
import {
  X,
  Route,
  MapPin,
  Plus,
  Trash2,
  Save,
  Clock,
  Navigation,
  ChevronUp,
  ChevronDown,
  AlertCircle
} from 'lucide-react';
import { useBusRouteService, useBusStopService, useBusService } from '../../../application/contexts/ServiceContext';

const RouteManagementModal = ({ isOpen, onClose, route = null, onSave }) => {
  const busRouteService = useBusRouteService();
  const busStopService = useBusStopService();
  const busService = useBusService();
  const [formData, setFormData] = useState({
    route_name: '',
    route_code: '',
    bus: null,
    stop_schedules: [],
    departure_time: '',
    arrival_time: '',
    route_type: 'both',
    total_distance: '',
    estimated_duration: '',
    is_active: true
  });

  const [availableBuses, setAvailableBuses] = useState([]);
  const [availableStops, setAvailableStops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      loadInitialData();
      if (route) {
        // Populate form with existing route data
        setFormData({
          route_name: route.route_name || '',
          route_code: route.route_code || '',
          bus: route.bus?.id || route.bus || null,
          stop_schedules: route.stop_schedules?.map((schedule, index) => ({
            bus_stop: schedule.bus_stop?.id || schedule.bus_stop || '',
            stop_order: schedule.stop_order || index + 1,
            pickup_time: schedule.pickup_time || '',
            drop_time: schedule.drop_time || '',
            waiting_time: schedule.waiting_time || 2,
            distance_from_previous: schedule.distance_from_previous || '',
            is_active: schedule.is_active !== undefined ? schedule.is_active : true
          })) || [],
          departure_time: route.departure_time || '',
          arrival_time: route.arrival_time || '',
          route_type: route.route_type || 'both',
          total_distance: route.total_distance || '',
          estimated_duration: route.estimated_duration || '',
          is_active: route.is_active !== undefined ? route.is_active : true
        });
      }
    }
  }, [isOpen, route]);

  const loadInitialData = async () => {
    try {
      const [busesResult, stopsResult] = await Promise.all([
        busService.getAllBuses(),
        busStopService.getAllBusStops()
      ]);
      setAvailableBuses(busesResult.success ? busesResult.data : []);
      setAvailableStops(stopsResult.success ? stopsResult.data : []);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const addBusStop = () => {
    setFormData(prev => ({
      ...prev,
      stop_schedules: [
        ...prev.stop_schedules,
        {
          bus_stop: '',
          stop_order: prev.stop_schedules.length + 1,
          pickup_time: '',
          drop_time: '',
          waiting_time: 2,
          distance_from_previous: '',
          is_active: true
        }
      ]
    }));
  };

  const updateBusStop = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      stop_schedules: prev.stop_schedules.map((schedule, i) =>
        i === index ? { ...schedule, [field]: value } : schedule
      )
    }));
  };

  const removeBusStop = (index) => {
    setFormData(prev => ({
      ...prev,
      stop_schedules: prev.stop_schedules.filter((_, i) => i !== index)
        .map((schedule, i) => ({ ...schedule, stop_order: i + 1 }))
    }));
  };

  const moveStop = (index, direction) => {
    const newSchedules = [...formData.stop_schedules];
    const newIndex = direction === 'up' ? index - 1 : index + 1;

    if (newIndex >= 0 && newIndex < newSchedules.length) {
      [newSchedules[index], newSchedules[newIndex]] = [newSchedules[newIndex], newSchedules[index]];
      newSchedules.forEach((schedule, i) => { schedule.stop_order = i + 1; });
      setFormData(prev => ({ ...prev, stop_schedules: newSchedules }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.route_name) newErrors.route_name = 'Route name is required';
    if (!formData.route_code) newErrors.route_code = 'Route number is required';
    if (!formData.departure_time) newErrors.departure_time = 'Departure time is required';
    if (formData.stop_schedules.length < 2) newErrors.stop_schedules = 'At least 2 stops are required';

    formData.stop_schedules.forEach((schedule, index) => {
      if (!schedule.bus_stop) newErrors[`stop_${index}`] = 'Stop is required';
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      // Helper function to format time for Strapi
      const formatTimeForStrapi = (time) => {
        if (!time) return null;
        // If time is already in HH:mm:ss format, return as is
        if (time.includes(':') && time.split(':').length === 3) {
          return time;
        }
        // Convert HH:mm to HH:mm:ss.SSS
        return `${time}:00.000`;
      };

      // Prepare data for submission
      const submitData = {
        route_name: formData.route_name,
        route_code: formData.route_code,
        bus: formData.bus ? Number(formData.bus) : null,
        stop_schedules: formData.stop_schedules.map(schedule => ({
          bus_stop: Number(schedule.bus_stop),
          stop_order: schedule.stop_order,
          pickup_time: formatTimeForStrapi(schedule.pickup_time),
          drop_time: formatTimeForStrapi(schedule.drop_time),
          waiting_time: schedule.waiting_time || 2,
          distance_from_previous: schedule.distance_from_previous ? parseFloat(schedule.distance_from_previous) : null,
          is_active: schedule.is_active
        })),
        departure_time: formatTimeForStrapi(formData.departure_time),
        arrival_time: formatTimeForStrapi(formData.arrival_time),
        route_type: formData.route_type,
        total_distance: formData.total_distance ? parseFloat(formData.total_distance) : null,
        estimated_duration: formData.estimated_duration ? parseInt(formData.estimated_duration) : null,
        is_active: formData.is_active
      };

      let result;
      if (route?.id) {
        const updateResult = await busRouteService.updateRoute(route.id, submitData);
        if (!updateResult.success) {
          throw new Error(updateResult.error || 'Failed to update route');
        }
        result = updateResult.data;
      } else {
        const createResult = await busRouteService.createRoute(submitData);
        if (!createResult.success) {
          throw new Error(createResult.error || 'Failed to create route');
        }
        result = createResult.data;
      }

      onSave(result);
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error saving route:', error);
      setErrors({ submit: 'Failed to save route. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      route_name: '',
      route_code: '',
      bus: null,
      stop_schedules: [],
      departure_time: '',
      arrival_time: '',
      route_type: 'both',
      total_distance: '',
      estimated_duration: '',
      is_active: true
    });
    setErrors({});
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Route className="h-8 w-8" />
              <h2 className="text-2xl font-bold">
                {route ? 'Edit Route' : 'Add New Route'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {errors.submit && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <span className="text-red-700">{errors.submit}</span>
            </div>
          )}

          {/* Basic Information */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Navigation className="h-5 w-5 text-indigo-600" />
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Route Name *
                </label>
                <input
                  type="text"
                  name="route_name"
                  value={formData.route_name}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.route_name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., North City Route"
                />
                {errors.route_name && (
                  <span className="text-red-500 text-xs mt-1">{errors.route_name}</span>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Route Number *
                </label>
                <input
                  type="text"
                  name="route_code"
                  value={formData.route_code}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.route_code ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., R101"
                />
                {errors.route_code && (
                  <span className="text-red-500 text-xs mt-1">{errors.route_code}</span>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assigned Bus
                </label>
                <select
                  name="bus"
                  value={formData.bus || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Bus</option>
                  {availableBuses.map(bus => (
                    <option key={bus.id} value={bus.id}>
                      {bus.bus_number || `Bus ${bus.id}`} - {bus.total_seats || 50} seats
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Route Type
                </label>
                <select
                  name="route_type"
                  value={formData.route_type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="morning">Morning</option>
                  <option value="evening">Evening</option>
                  <option value="both">Both</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Departure Time *
                </label>
                <input
                  type="time"
                  name="departure_time"
                  value={formData.departure_time}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.departure_time ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.departure_time && (
                  <span className="text-red-500 text-xs mt-1">{errors.departure_time}</span>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Arrival Time
                </label>
                <input
                  type="time"
                  name="arrival_time"
                  value={formData.arrival_time}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Distance (km)
                </label>
                <input
                  type="number"
                  name="total_distance"
                  value={formData.total_distance}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., 25"
                  step="0.1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estimated Duration (minutes)
                </label>
                <input
                  type="number"
                  name="estimated_duration"
                  value={formData.estimated_duration}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., 45"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-indigo-600"
                />
                <span className="text-sm font-medium text-gray-700">Route is Active</span>
              </label>
            </div>
          </div>

          {/* Bus Stops */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <MapPin className="h-5 w-5 text-indigo-600" />
                Route Stops Schedule
              </h3>
              <button
                type="button"
                onClick={addBusStop}
                className="px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 text-sm"
              >
                <Plus className="h-4 w-4" />
                Add Stop
              </button>
            </div>

            {errors.stop_schedules && (
              <div className="mb-2 text-red-500 text-sm">{errors.stop_schedules}</div>
            )}

            {/* Header row for stop schedules */}
            {formData.stop_schedules.length > 0 && (
              <div className="hidden lg:grid lg:grid-cols-12 gap-2 px-3 py-2 bg-gray-100 rounded-t-lg text-xs font-semibold text-gray-600">
                <div className="col-span-1 text-center">Order</div>
                <div className="col-span-3">Bus Stop</div>
                <div className="col-span-2 text-center">Pickup Time</div>
                <div className="col-span-2 text-center">Drop Time</div>
                <div className="col-span-1 text-center">Distance</div>
                <div className="col-span-1 text-center">Wait</div>
                <div className="col-span-1 text-center">Active</div>
                <div className="col-span-1 text-center">Actions</div>
              </div>
            )}

            <div className="space-y-2">
              {formData.stop_schedules.map((schedule, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  {/* Mobile/Tablet View */}
                  <div className="lg:hidden space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-600">Stop #{index + 1}</span>
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => moveStop(index, 'up')}
                            disabled={index === 0}
                            className="p-1 text-gray-500 hover:text-indigo-600 disabled:opacity-30"
                          >
                            <ChevronUp className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveStop(index, 'down')}
                            disabled={index === formData.stop_schedules.length - 1}
                            className="p-1 text-gray-500 hover:text-indigo-600 disabled:opacity-30"
                          >
                            <ChevronDown className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeBusStop(index)}
                        className="p-1 text-red-600 hover:bg-red-100 rounded"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-xs text-gray-600 mb-1">Bus Stop</label>
                        <select
                          value={schedule.bus_stop}
                          onChange={(e) => updateBusStop(index, 'bus_stop', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                            errors[`stop_${index}`] ? 'border-red-500' : 'border-gray-300'
                          }`}
                        >
                          <option value="">Select Stop</option>
                          {availableStops.map(s => (
                            <option key={s.id} value={s.id}>
                              {s.stop_name}
                            </option>
                          ))}
                        </select>
                        {errors[`stop_${index}`] && (
                          <span className="text-red-500 text-xs">{errors[`stop_${index}`]}</span>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Pickup Time</label>
                        <input
                          type="time"
                          value={schedule.pickup_time}
                          onChange={(e) => updateBusStop(index, 'pickup_time', e.target.value)}
                          className="w-full px-2 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Drop Time</label>
                        <input
                          type="time"
                          value={schedule.drop_time}
                          onChange={(e) => updateBusStop(index, 'drop_time', e.target.value)}
                          className="w-full px-2 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Distance (km)</label>
                        <input
                          type="number"
                          value={schedule.distance_from_previous}
                          onChange={(e) => updateBusStop(index, 'distance_from_previous', e.target.value)}
                          className="w-full px-2 py-2 border border-gray-300 rounded-lg text-sm"
                          placeholder="0.0"
                          step="0.1"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Wait Time (min)</label>
                        <input
                          type="number"
                          value={schedule.waiting_time}
                          onChange={(e) => updateBusStop(index, 'waiting_time', e.target.value)}
                          className="w-full px-2 py-2 border border-gray-300 rounded-lg text-sm"
                          placeholder="2"
                          min="0"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={schedule.is_active}
                            onChange={(e) => updateBusStop(index, 'is_active', e.target.checked)}
                            className="h-4 w-4 text-indigo-600"
                          />
                          <span className="text-sm">Stop is Active</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Desktop View - Grid Layout */}
                  <div className="hidden lg:grid lg:grid-cols-12 gap-2 items-center">
                    <div className="col-span-1 flex items-center justify-center gap-1">
                      <div className="flex flex-col gap-1">
                        <button
                          type="button"
                          onClick={() => moveStop(index, 'up')}
                          disabled={index === 0}
                          className="p-0.5 text-gray-500 hover:text-indigo-600 disabled:opacity-30"
                        >
                          <ChevronUp className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveStop(index, 'down')}
                          disabled={index === formData.stop_schedules.length - 1}
                          className="p-0.5 text-gray-500 hover:text-indigo-600 disabled:opacity-30"
                        >
                          <ChevronDown className="h-3 w-3" />
                        </button>
                      </div>
                      <span className="text-sm font-semibold text-gray-600">#{index + 1}</span>
                    </div>
                    <div className="col-span-3">
                      <select
                        value={schedule.bus_stop}
                        onChange={(e) => updateBusStop(index, 'bus_stop', e.target.value)}
                        className={`w-full px-2 py-1.5 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                          errors[`stop_${index}`] ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select Stop</option>
                        {availableStops.map(s => (
                          <option key={s.id} value={s.id}>
                            {s.stop_name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-2">
                      <input
                        type="time"
                        value={schedule.pickup_time}
                        onChange={(e) => updateBusStop(index, 'pickup_time', e.target.value)}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="time"
                        value={schedule.drop_time}
                        onChange={(e) => updateBusStop(index, 'drop_time', e.target.value)}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                      />
                    </div>
                    <div className="col-span-1">
                      <input
                        type="number"
                        value={schedule.distance_from_previous}
                        onChange={(e) => updateBusStop(index, 'distance_from_previous', e.target.value)}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                        placeholder="0"
                        step="0.1"
                      />
                    </div>
                    <div className="col-span-1">
                      <input
                        type="number"
                        value={schedule.waiting_time}
                        onChange={(e) => updateBusStop(index, 'waiting_time', e.target.value)}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                        placeholder="2"
                        min="0"
                      />
                    </div>
                    <div className="col-span-1 flex justify-center">
                      <input
                        type="checkbox"
                        checked={schedule.is_active}
                        onChange={(e) => updateBusStop(index, 'is_active', e.target.checked)}
                        className="h-4 w-4 text-indigo-600"
                      />
                    </div>
                    <div className="col-span-1 flex justify-center">
                      <button
                        type="button"
                        onClick={() => removeBusStop(index)}
                        className="p-1 text-red-600 hover:bg-red-100 rounded"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {formData.stop_schedules.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No stops added yet. Click "Add Stop" to begin.
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:from-indigo-700 hover:to-blue-700 disabled:opacity-50 flex items-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {route ? 'Update Route' : 'Create Route'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RouteManagementModal;