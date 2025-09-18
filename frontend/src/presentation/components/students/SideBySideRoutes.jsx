import React from 'react';
import { Activity, Tag, Users } from 'lucide-react';
import RouteVisualization from './RouteVisualization';

const SideBySideRoutes = ({ pickupRoutes, selectedPickupStopId, currentSeatInfo, hasExistingSeat, onSelectStop }) => {
  return (
    <div className="space-y-8">
      <div>
        {/* Pickup Routes */}
        <div>
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-800 flex items-center">
              <div className="p-2 bg-blue-100 rounded-full mr-3">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
              Bus Routes
            </h3>
            <p className="text-sm text-gray-600 ml-11">Routes available for your selected pickup stop</p>
          </div>

          <div className="space-y-6">
            {pickupRoutes && pickupRoutes.length > 0 ? (
              pickupRoutes.map(route => (
                <RouteVisualization
                  key={`pickup-${route.id}`}
                  route={route}
                  selectedStopId={selectedPickupStopId}
                  routeType="pickup"
                  onSelectStop={(stop) => onSelectStop && onSelectStop(stop)}
                />
              ))
            ) : (
              <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No bus routes available</p>
                <p className="text-sm text-gray-500 mt-2">Please select a location to see available routes</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SideBySideRoutes;
