import React from 'react';
import { Activity, Tag, Users } from 'lucide-react';
// Import RouteVisualization from transport folder
import RouteVisualization from '../transport/RouteVisualization';

const SideBySideRoutes = ({ pickupRoutes, selectedPickupStopId, currentSeatInfo, hasExistingSeat, onSelectStop }) => {
  return (
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
  );
};

export default SideBySideRoutes;
