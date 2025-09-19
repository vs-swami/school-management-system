import React, { useState, useEffect } from 'react';
import {
  X,
  MapPin,
  Save,
  Navigation,
  Clock,
  AlertCircle,
  Map,
  Users,
  Compass
} from 'lucide-react';
import { BusStopRepository } from '../../../data/repositories/BusStopRepository';
import { LocationRepository } from '../../../data/repositories/LocationRepository';

const BusStopManagementModal = ({ isOpen, onClose, stop = null, onSave }) => {
  const [formData, setFormData] = useState({
    stop_name: '',
    location: null,
    latitude: '',
    longitude: '',
    landmark: '',
    pickup_time: '',
    drop_time: '',
    distance_from_school: '',
    estimated_students: 0,
    is_active: true,
    notes: ''
  });

  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [useCoordinates, setUseCoordinates] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadLocations();
      if (stop) {
        // Populate form with existing stop data
        setFormData({
          stop_name: stop.stop_name || '',
          location: stop.location?.id || stop.location || null,
          latitude: stop.latitude || '',
          longitude: stop.longitude || '',
          landmark: stop.landmark || '',
          pickup_time: stop.pickup_time || '',
          drop_time: stop.drop_time || '',
          distance_from_school: stop.distance_from_school || '',
          estimated_students: stop.estimated_students || 0,
          is_active: stop.is_active !== undefined ? stop.is_active : true,
          notes: stop.notes || ''
        });
        // Check if coordinates are present
        if (stop.latitude && stop.longitude) {
          setUseCoordinates(true);
        }
      }
    }
  }, [isOpen, stop]);

  const loadLocations = async () => {
    try {
      const locationsData = await LocationRepository.findAll();
      setLocations(locationsData || []);
    } catch (error) {
      console.error('Error loading locations:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value
    }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude.toFixed(6),
            longitude: position.coords.longitude.toFixed(6)
          }));
          setUseCoordinates(true);
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get current location. Please enter manually.');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.stop_name) newErrors.stop_name = 'Stop name is required';
    if (!formData.location && !useCoordinates) {
      newErrors.location = 'Location is required (or use coordinates)';
    }
    if (useCoordinates) {
      if (!formData.latitude) newErrors.latitude = 'Latitude is required';
      if (!formData.longitude) newErrors.longitude = 'Longitude is required';
      if (formData.latitude && (formData.latitude < -90 || formData.latitude > 90)) {
        newErrors.latitude = 'Invalid latitude (must be between -90 and 90)';
      }
      if (formData.longitude && (formData.longitude < -180 || formData.longitude > 180)) {
        newErrors.longitude = 'Invalid longitude (must be between -180 and 180)';
      }
    }

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
        location: formData.location ? Number(formData.location) : null,
        latitude: useCoordinates ? parseFloat(formData.latitude) : null,
        longitude: useCoordinates ? parseFloat(formData.longitude) : null,
        estimated_students: parseInt(formData.estimated_students) || 0,
        distance_from_school: formData.distance_from_school ? parseFloat(formData.distance_from_school) : null
      };

      let result;
      if (stop?.id) {
        result = await BusStopRepository.update(stop.id, submitData);
      } else {
        result = await BusStopRepository.create(submitData);
      }

      onSave(result);
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error saving stop:', error);
      setErrors({ submit: 'Failed to save stop. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      stop_name: '',
      location: null,
      latitude: '',
      longitude: '',
      landmark: '',
      pickup_time: '',
      drop_time: '',
      distance_from_school: '',
      estimated_students: 0,
      is_active: true,
      notes: ''
    });
    setErrors({});
    setUseCoordinates(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-green-600 to-teal-600 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MapPin className="h-8 w-8" />
              <h2 className="text-2xl font-bold">
                {stop ? 'Edit Bus Stop' : 'Add New Bus Stop'}
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
              <Navigation className="h-5 w-5 text-green-600" />
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stop Name *
                </label>
                <input
                  type="text"
                  name="stop_name"
                  value={formData.stop_name}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.stop_name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Main Street Corner"
                />
                {errors.stop_name && (
                  <span className="text-red-500 text-xs mt-1">{errors.stop_name}</span>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Landmark
                </label>
                <input
                  type="text"
                  name="landmark"
                  value={formData.landmark}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., Near City Mall"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estimated Students
                </label>
                <input
                  type="number"
                  name="estimated_students"
                  value={formData.estimated_students}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., 15"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Distance from School (km)
                </label>
                <input
                  type="number"
                  name="distance_from_school"
                  value={formData.distance_from_school}
                  onChange={handleInputChange}
                  step="0.1"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., 5.5"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Map className="h-5 w-5 text-green-600" />
              Location
            </h3>

            <div className="mb-4">
              <label className="flex items-center gap-2 mb-3">
                <input
                  type="checkbox"
                  checked={useCoordinates}
                  onChange={(e) => setUseCoordinates(e.target.checked)}
                  className="h-4 w-4 text-green-600"
                />
                <span className="text-sm font-medium text-gray-700">
                  Use GPS Coordinates instead of Location
                </span>
              </label>
            </div>

            {!useCoordinates ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Location *
                </label>
                <select
                  name="location"
                  value={formData.location || ''}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.location ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Location</option>
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name} - {loc.type}
                    </option>
                  ))}
                </select>
                {errors.location && (
                  <span className="text-red-500 text-xs mt-1">{errors.location}</span>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Latitude *
                    </label>
                    <input
                      type="number"
                      name="latitude"
                      value={formData.latitude}
                      onChange={handleInputChange}
                      step="0.000001"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                        errors.latitude ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="e.g., 28.6139"
                    />
                    {errors.latitude && (
                      <span className="text-red-500 text-xs mt-1">{errors.latitude}</span>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Longitude *
                    </label>
                    <input
                      type="number"
                      name="longitude"
                      value={formData.longitude}
                      onChange={handleInputChange}
                      step="0.000001"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                        errors.longitude ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="e.g., 77.2090"
                    />
                    {errors.longitude && (
                      <span className="text-red-500 text-xs mt-1">{errors.longitude}</span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={getCurrentLocation}
                  className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 flex items-center gap-2 text-sm font-medium"
                >
                  <Compass className="h-4 w-4" />
                  Get Current Location
                </button>
              </div>
            )}
          </div>

          {/* Timing */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-600" />
              Timing
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pickup Time
                </label>
                <input
                  type="time"
                  name="pickup_time"
                  value={formData.pickup_time}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Drop Time
                </label>
                <input
                  type="time"
                  name="drop_time"
                  value={formData.drop_time}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Any additional information about this stop..."
            />
          </div>

          <div className="mb-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleInputChange}
                className="h-4 w-4 text-green-600"
              />
              <span className="text-sm font-medium text-gray-700">Stop is Active</span>
            </label>
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
              className="px-6 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:from-green-700 hover:to-teal-700 disabled:opacity-50 flex items-center gap-2"
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
                  {stop ? 'Update Stop' : 'Create Stop'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BusStopManagementModal;