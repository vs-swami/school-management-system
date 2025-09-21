import React, { useState, useEffect } from 'react';
import {
  X,
  MapPin,
  Save,
  Navigation,
  AlertCircle,
  Map,
  Users,
  Compass
} from 'lucide-react';
import { useBusStopService, useLocationService } from '../../../application/contexts/ServiceContext';

const BusStopManagementModal = ({ isOpen, onClose, stop = null, onSave }) => {
  const busStopService = useBusStopService();
  const locationService = useLocationService();

  const [formData, setFormData] = useState({
    stop_name: '',
    location: null,
    latitude: '',
    longitude: '',
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
        const hasCoordinates = stop.coordinates && stop.coordinates.lat && stop.coordinates.lng;
        setFormData({
          stop_name: stop.stopName || '',
          location: stop.location?.id || stop.location || null,
          latitude: hasCoordinates ? stop.coordinates.lat : '',
          longitude: hasCoordinates ? stop.coordinates.lng : '',
          is_active: stop.isActive !== undefined ? stop.isActive : true,
          notes: stop.notes || ''
        });
        // Check if coordinates are present
        if (hasCoordinates) {
          setUseCoordinates(true);
        }
      }
    }
  }, [isOpen, stop]);

  const loadLocations = async () => {
    try {
      const result = await locationService.getAllLocations();
      setLocations(result.success ? result.data : []);
    } catch (error) {
      console.error('Error loading locations:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCoordinateToggle = () => {
    setUseCoordinates(!useCoordinates);
    if (!useCoordinates) {
      setFormData(prev => ({ ...prev, location: null }));
    } else {
      setFormData(prev => ({ ...prev, latitude: '', longitude: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.stop_name) {
      setErrors({ stop_name: 'Stop name is required' });
      return;
    }

    if (!formData.location && !formData.latitude && !formData.longitude) {
      setErrors({ location: 'Either location or coordinates are required' });
      return;
    }

    setLoading(true);

    try {
      let result;
      if (stop) {
        // Update existing stop
        const updateResult = await busStopService.updateBusStop(stop.id, formData);
        if (!updateResult.success) {
          throw new Error(updateResult.error || 'Failed to update bus stop');
        }
        result = updateResult.data;
      } else {
        // Create new stop
        const createResult = await busStopService.createBusStop(formData);
        if (!createResult.success) {
          throw new Error(createResult.error || 'Failed to create bus stop');
        }
        result = createResult.data;
      }

      if (result) {
        onSave(result);
        handleClose();
      }
    } catch (error) {
      console.error('Error saving bus stop:', error);
      setErrors({ submit: 'Failed to save bus stop. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      stop_name: '',
      location: null,
      latitude: '',
      longitude: '',
      is_active: true,
      notes: ''
    });
    setErrors({});
    setUseCoordinates(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MapPin className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                {stop ? 'Edit Bus Stop' : 'Add New Bus Stop'}
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Stop Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stop Name *
            </label>
            <input
              type="text"
              name="stop_name"
              value={formData.stop_name}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.stop_name ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter stop name"
            />
            {errors.stop_name && (
              <p className="mt-1 text-sm text-red-600">{errors.stop_name}</p>
            )}
          </div>

          {/* Location Type Toggle */}
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={() => setUseCoordinates(false)}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                !useCoordinates
                  ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                  : 'bg-gray-100 text-gray-600 border-2 border-gray-200'
              }`}
            >
              <Map className="h-4 w-4" />
              <span>Use Location</span>
            </button>
            <button
              type="button"
              onClick={() => setUseCoordinates(true)}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                useCoordinates
                  ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                  : 'bg-gray-100 text-gray-600 border-2 border-gray-200'
              }`}
            >
              <Compass className="h-4 w-4" />
              <span>Use Coordinates</span>
            </button>
          </div>

          {/* Location Dropdown or Coordinates */}
          {!useCoordinates ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <select
                name="location"
                value={formData.location || ''}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.location ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Select a location</option>
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} {loc.city && `- ${loc.city}`}
                  </option>
                ))}
              </select>
              {errors.location && (
                <p className="mt-1 text-sm text-red-600">{errors.location}</p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Latitude *
                </label>
                <input
                  type="number"
                  step="any"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.latitude ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="-90 to 90"
                />
                {errors.latitude && (
                  <p className="mt-1 text-sm text-red-600">{errors.latitude}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Longitude *
                </label>
                <input
                  type="number"
                  step="any"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.longitude ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="-180 to 180"
                />
                {errors.longitude && (
                  <p className="mt-1 text-sm text-red-600">{errors.longitude}</p>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Additional information about this stop"
            />
          </div>

          {/* Active Status */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 text-sm text-gray-700">
              Active Stop
            </label>
          </div>

          {/* Error Message */}
          {errors.submit && (
            <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm">{errors.submit}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>{loading ? 'Saving...' : 'Save Stop'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BusStopManagementModal;