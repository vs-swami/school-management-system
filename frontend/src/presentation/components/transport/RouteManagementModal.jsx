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
import { BusRouteRepository } from '../../../data/repositories/BusRouteRepository';
import { BusStopRepository } from '../../../data/repositories/BusStopRepository';
import { BusRepository } from '../../../data/repositories/BusRepository';

const RouteManagementModal = ({ isOpen, onClose, route = null, onSave }) => {
  const [formData, setFormData] = useState({
    route_name: '',
    route_number: '',
    bus: null,
    bus_stops: [],
    start_time: '',
    end_time: '',
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
          route_number: route.route_number || '',
          bus: route.bus?.id || route.bus || null,
          bus_stops: route.bus_stops?.map(stop => ({
            id: stop.id || stop,
            order: stop.order || 0,
            arrival_time: stop.arrival_time || ''
          })) || [],
          start_time: route.start_time || '',
          end_time: route.end_time || '',
          total_distance: route.total_distance || '',
          estimated_duration: route.estimated_duration || '',
          is_active: route.is_active !== undefined ? route.is_active : true
        });
      }
    }
  }, [isOpen, route]);

  const loadInitialData = async () => {
    try {
      const [buses, stops] = await Promise.all([
        BusRepository.findAll(),
        BusStopRepository.findAll()
      ]);
      setAvailableBuses(buses || []);
      setAvailableStops(stops || []);
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
      bus_stops: [
        ...prev.bus_stops,
        { id: '', order: prev.bus_stops.length, arrival_time: '' }
      ]
    }));
  };

  const updateBusStop = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      bus_stops: prev.bus_stops.map((stop, i) =>
        i === index ? { ...stop, [field]: value } : stop
      )
    }));
  };

  const removeBusStop = (index) => {
    setFormData(prev => ({
      ...prev,
      bus_stops: prev.bus_stops.filter((_, i) => i !== index)
        .map((stop, i) => ({ ...stop, order: i }))
    }));
  };

  const moveStop = (index, direction) => {
    const newStops = [...formData.bus_stops];
    const newIndex = direction === 'up' ? index - 1 : index + 1;

    if (newIndex >= 0 && newIndex < newStops.length) {
      [newStops[index], newStops[newIndex]] = [newStops[newIndex], newStops[index]];
      newStops.forEach((stop, i) => { stop.order = i; });
      setFormData(prev => ({ ...prev, bus_stops: newStops }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.route_name) newErrors.route_name = 'Route name is required';
    if (!formData.route_number) newErrors.route_number = 'Route number is required';
    if (formData.bus_stops.length < 2) newErrors.bus_stops = 'At least 2 stops are required';

    formData.bus_stops.forEach((stop, index) => {
      if (!stop.id) newErrors[`stop_${index}`] = 'Stop is required';
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      // Prepare data for submission
      const submitData = {
        ...formData,
        bus: formData.bus ? Number(formData.bus) : null,
        bus_stops: formData.bus_stops.map(stop => Number(stop.id)).filter(id => id)
      };

      let result;
      if (route?.id) {
        result = await BusRouteRepository.update(route.id, submitData);
      } else {
        result = await BusRouteRepository.create(submitData);
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
      route_number: '',
      bus: null,
      bus_stops: [],
      start_time: '',
      end_time: '',
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
                  name="route_number"
                  value={formData.route_number}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.route_number ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., R101"
                />
                {errors.route_number && (
                  <span className="text-red-500 text-xs mt-1">{errors.route_number}</span>
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
                  Total Distance (km)
                </label>
                <input
                  type="number"
                  name="total_distance"
                  value={formData.total_distance}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., 25"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time
                </label>
                <input
                  type="time"
                  name="start_time"
                  value={formData.start_time}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Time
                </label>
                <input
                  type="time"
                  name="end_time"
                  value={formData.end_time}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                Bus Stops
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

            {errors.bus_stops && (
              <div className="mb-2 text-red-500 text-sm">{errors.bus_stops}</div>
            )}

            <div className="space-y-3">
              {formData.bus_stops.map((stop, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex flex-col gap-1">
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
                      disabled={index === formData.bus_stops.length - 1}
                      className="p-1 text-gray-500 hover:text-indigo-600 disabled:opacity-30"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-600">
                    #{index + 1}
                  </div>

                  <div className="flex-1">
                    <select
                      value={stop.id}
                      onChange={(e) => updateBusStop(index, 'id', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        errors[`stop_${index}`] ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select Stop</option>
                      {availableStops.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.stop_name} - {s.location?.name || 'Location'}
                        </option>
                      ))}
                    </select>
                    {errors[`stop_${index}`] && (
                      <span className="text-red-500 text-xs">{errors[`stop_${index}`]}</span>
                    )}
                  </div>

                  <div className="w-32">
                    <input
                      type="time"
                      value={stop.arrival_time}
                      onChange={(e) => updateBusStop(index, 'arrival_time', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      placeholder="Arrival"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => removeBusStop(index)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}

              {formData.bus_stops.length === 0 && (
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