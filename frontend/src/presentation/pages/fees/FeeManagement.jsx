import React, { useEffect, useState } from 'react';
import { useClassStore } from '../../../application/stores/useClassStore';
import { School, DollarSign, MapPin, ToggleLeft, ToggleRight } from 'lucide-react';
import UnifiedFeeManager from '../../components/fees/UnifiedFeeManager';
import { useBusStopService } from '../../../application/contexts/ServiceContext';

const FeeManagement = () => {
  const { classes, fetchClasses } = useClassStore();
  const busStopService = useBusStopService();
  const [entityType, setEntityType] = useState('class');
  const [selectedEntityId, setSelectedEntityId] = useState('');
  const [busStops, setBusStops] = useState([]);
  const [loadingBusStops, setLoadingBusStops] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  useEffect(() => {
    if (entityType === 'busStop') {
      fetchBusStops();
    }
  }, [entityType]);

  const fetchBusStops = async () => {
    setLoadingBusStops(true);
    try {
      const result = await busStopService.getAllBusStops();
      setBusStops(result.success ? result.data : []);
    } catch (error) {
      console.error('Error fetching bus stops:', error);
      setBusStops([]);
    } finally {
      setLoadingBusStops(false);
    }
  };

  const sortedClasses = [...classes].sort((a, b) => {
    const nameA = a.classname || a.className || '';
    const nameB = b.classname || b.className || '';
    return nameA.localeCompare(nameB, undefined, { numeric: true });
  });

  const sortedBusStops = [...busStops].sort((a, b) => {
    const nameA = a.stop_name || a.stopName || '';
    const nameB = b.stop_name || b.stopName || '';
    return nameA.localeCompare(nameB);
  });

  const handleEntityTypeChange = (newType) => {
    setEntityType(newType);
    setSelectedEntityId('');
  };

  const getSelectedEntity = () => {
    if (entityType === 'class') {
      return sortedClasses.find(c => c.id === parseInt(selectedEntityId));
    } else {
      return sortedBusStops.find(s => s.id === parseInt(selectedEntityId));
    }
  };

  const entity = getSelectedEntity();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-green-600" />
            Fee Management
          </h1>
          <p className="text-gray-600 mt-2">Manage fees via Fee Definitions and Assignments. Select an entity type and then choose a specific item to manage its fees.</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Entity Type</label>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEntityTypeChange('class')}
                  className={`flex-1 px-4 py-2 rounded-lg border transition-all flex items-center justify-center gap-2 ${
                    entityType === 'class'
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <School className="w-4 h-4" />
                  Classes
                  {entityType === 'class' ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => handleEntityTypeChange('busStop')}
                  className={`flex-1 px-4 py-2 rounded-lg border transition-all flex items-center justify-center gap-2 ${
                    entityType === 'busStop'
                      ? 'bg-green-50 border-green-500 text-green-700'
                      : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <MapPin className="w-4 h-4" />
                  Bus Stops
                  {entityType === 'busStop' ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Select {entityType === 'class' ? 'Class' : 'Bus Stop'}
              </label>
              <select
                className="w-full border rounded px-3 py-2"
                value={selectedEntityId}
                onChange={(e) => setSelectedEntityId(e.target.value)}
                disabled={loadingBusStops && entityType === 'busStop'}
              >
                <option value="">
                  {loadingBusStops && entityType === 'busStop'
                    ? '— Loading bus stops —'
                    : `— Choose a ${entityType === 'class' ? 'class' : 'bus stop'} —`}
                </option>
                {entityType === 'class' ? (
                  sortedClasses.map((cls) => (
                    <option key={cls.id} value={cls.id}>{cls.classname || cls.className || `Class ${cls.id}`}</option>
                  ))
                ) : (
                  sortedBusStops.map((stop) => (
                    <option key={stop.id} value={stop.id}>{stop.stop_name || stop.stopName || `Stop ${stop.id}`}</option>
                  ))
                )}
              </select>
            </div>

            <div className="text-gray-500 flex items-center gap-2">
              {entityType === 'class' ? (
                <>
                  <School className="w-5 h-5" /> {classes.length} classes loaded
                </>
              ) : (
                <>
                  <MapPin className="w-5 h-5" /> {busStops.length} bus stops loaded
                </>
              )}
            </div>
          </div>
        </div>

        {selectedEntityId && entity ? (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <UnifiedFeeManager
              entityType={entityType}
              entityId={parseInt(selectedEntityId)}
              entityName={entityType === 'class' ? (entity.classname || entity.className) : (entity.stop_name || entity.stopName)}
              isEmbedded={true}
            />
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-500 border border-gray-200">
            Select a {entityType === 'class' ? 'class' : 'bus stop'} to view and manage its fee assignments.
          </div>
        )}
      </div>
    </div>
  );
};

export default FeeManagement;

