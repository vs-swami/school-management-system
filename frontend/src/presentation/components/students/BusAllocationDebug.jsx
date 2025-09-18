import React from 'react';

const BusAllocationDebug = ({ watch, busStops, pickupStopRoutes }) => {
  const pickupStopId = watch('enrollments.0.administration.seat_allocations.0.pickup_stop');
  const allFormData = watch();

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <h4 className="font-bold text-yellow-800 mb-3">🐛 Bus Allocation Debug Info</h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <h5 className="font-semibold text-yellow-800 mb-2">Form Values:</h5>
          <div className="space-y-1">
            <div><strong>Pickup Stop ID:</strong> {pickupStopId || 'Not selected'}</div>
          </div>
        </div>

        <div>
          <h5 className="font-semibold text-yellow-800 mb-2">Data Counts:</h5>
          <div className="space-y-1">
            <div><strong>Bus Stops:</strong> {busStops?.length || 0}</div>
            <div><strong>Bus Routes:</strong> {pickupStopRoutes?.length || 0}</div>
          </div>
        </div>
      </div>

      <details className="mt-4">
        <summary className="cursor-pointer font-semibold text-yellow-800">
          View Raw Form Data (Enrollment)
        </summary>
        <pre className="mt-2 p-2 bg-yellow-100 rounded text-xs overflow-auto max-h-40">
          {JSON.stringify(allFormData?.enrollments?.[0], null, 2)}
        </pre>
      </details>

      <details className="mt-2">
        <summary className="cursor-pointer font-semibold text-yellow-800">
          View Bus Stops Data
        </summary>
        <pre className="mt-2 p-2 bg-yellow-100 rounded text-xs overflow-auto max-h-40">
          {JSON.stringify(busStops?.slice(0, 3), null, 2)}
        </pre>
      </details>
    </div>
  );
};

export default BusAllocationDebug;