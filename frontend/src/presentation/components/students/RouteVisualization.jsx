import React, { useState } from 'react';
import { Activity, Users, Calendar, Gauge, Tag, CheckCircle, AlertCircle } from 'lucide-react';

const RouteVisualization = ({ route, selectedStopId, routeType = "pickup", onSelectStop }) => {
  const [hoveredStopId, setHoveredStopId] = useState(null);

  if (!route || !route.bus_stops) return null;

  // Calculate provisional seat allocation for selected stop
  const getProvisionalSeatInfo = (stopId) => {
    if (!route.bus || !stopId) return null;

    const totalSeats = route.bus.total_seats || 50;

    // For now, since we haven't stored any actual allocations yet,
    // show that this would be the first seat assignment
    const allocatedSeats = 0; // No seats allocated yet
    const availableSeats = totalSeats;
    const nextSeatNumber = 1; // This student would get seat #1

    return {
      totalSeats,
      allocatedSeats,
      availableSeats: availableSeats - 1, // Minus 1 for this student
      nextSeatNumber,
      utilization: Math.round((1 / totalSeats) * 100) // Just this student = ~2-4% depending on bus size
    };
  };

  const getStopStatus = (stop) => {
    if (stop.id === parseInt(selectedStopId)) return 'selected';
    if (!stop.is_active) return 'inactive';
    return 'active';
  };

  const getStopColor = (status) => {
    switch (status) {
      case 'selected': return 'bg-blue-500 border-blue-600';
      case 'inactive': return 'bg-gray-300 border-gray-400';
      default: return 'bg-green-500 border-green-600';
    }
  };

  const getConnectorColor = (fromStop, toStop) => {
    const fromStatus = getStopStatus(fromStop);
    const toStatus = getStopStatus(toStop);

    if (fromStatus === 'selected' || toStatus === 'selected') {
      return 'bg-blue-400';
    }
    if (fromStatus === 'inactive' && toStatus === 'inactive') {
      return 'bg-gray-300';
    }
    return 'bg-green-400';
  };

  return (
    <>
      {/* Route Information Card */}
      <div className={`bg-white rounded-lg shadow-md border p-6 mb-4 border-gray-200`}>
        {/* Route Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full ${routeType === 'pickup' ? 'bg-blue-100' : 'bg-purple-100'}`}>
              <Activity className={`h-6 w-6 ${routeType === 'pickup' ? 'text-blue-600' : 'text-purple-600'}`} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">{route.route_name}</h3>
              <p className="text-sm text-gray-600">{routeType.charAt(0).toUpperCase() + routeType.slice(1)} Route • {route.route_code}</p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
            routeType === 'pickup'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-purple-100 text-purple-800'
          }`}>
            {route.route_type}
          </div>
        </div>

        {/* Bus Information */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-full">
                <Users className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-800">Bus #{route.bus.bus_number}</p>
                <p className="text-sm text-gray-600">{route.bus.license_plate}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-1 text-sm text-gray-600">
                <Users className="h-4 w-4" />
                <span>{route.bus.total_seats} seats</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Driver: {route.bus.driver_name}</p>
            </div>
          </div>

          {/* Provisional Seat Info when stop is selected */}
          {selectedStopId && (
            (() => {
              const seatInfo = getProvisionalSeatInfo(selectedStopId);
              if (!seatInfo) return null;

              return (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-sm font-semibold text-blue-800 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Provisional Seat Assignment
                    </h5>
                    <span className="text-xs text-blue-600 font-medium bg-blue-100 px-2 py-1 rounded">Estimated</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div className="text-center">
                      <p className="text-blue-600 font-semibold text-lg">#{seatInfo.nextSeatNumber}</p>
                      <p className="text-gray-600">Your Seat</p>
                    </div>
                    <div className="text-center">
                      <p className="text-green-600 font-semibold">{seatInfo.availableSeats - 1}</p>
                      <p className="text-gray-600">Remaining</p>
                    </div>
                    <div className="text-center">
                      <p className={`font-semibold ${seatInfo.utilization > 80 ? 'text-red-600' : seatInfo.utilization > 60 ? 'text-yellow-600' : 'text-green-600'}`}>
                        {Math.round(((seatInfo.allocatedSeats + 1) / seatInfo.totalSeats) * 100)}%
                      </p>
                      <p className="text-gray-600">Full</p>
                    </div>
                  </div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        ((seatInfo.allocatedSeats + 1) / seatInfo.totalSeats) > 0.8 ? 'bg-red-400' :
                        ((seatInfo.allocatedSeats + 1) / seatInfo.totalSeats) > 0.6 ? 'bg-yellow-400' : 'bg-green-400'
                      }`}
                      style={{ width: `${Math.round(((seatInfo.allocatedSeats + 1) / seatInfo.totalSeats) * 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2 italic">
                    * Actual seat assignment will be confirmed after enrollment
                  </p>
                </div>
              );
            })()
          )}

          {/* Timing Information */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1 text-sm">
                <Calendar className="h-4 w-4 text-green-600" />
                <span className="text-gray-600">Departure:</span>
                <span className="font-semibold text-gray-800">{route.departure_time}</span>
              </div>
              <div className="flex items-center space-x-1 text-sm">
                <Calendar className="h-4 w-4 text-red-600" />
                <span className="text-gray-600">Arrival:</span>
                <span className="font-semibold text-gray-800">{route.arrival_time}</span>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              <Gauge className="h-4 w-4 inline mr-1" />
              {route.total_distance} km
            </div>
          </div>
        </div>

        {/* Route Visualization Header */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-800 flex items-center">
            <Tag className="h-5 w-5 mr-2 text-gray-600" />
            Route Stops
          </h4>
        </div>
      </div>

      {/* Full-width route visualization */}
      <div className="relative overflow-x-auto bg-gray-50 py-6 px-4 rounded-lg mb-6">
        <div className="flex items-center space-x-4 min-w-max pb-4">
          {route.bus_stops.map((stop, index) => {
            const status = getStopStatus(stop);
            const isLast = index === route.bus_stops.length - 1;

            return (
              <div key={stop.id} className="relative flex flex-col items-center">
                {/* Stop Information */}
                <div
                  className={`p-3 rounded-lg border-2 mb-3 min-w-[200px] transition-all duration-200 ${
                  status === 'selected'
                    ? 'bg-blue-50 border-blue-500 shadow-lg'
                    : status === 'inactive'
                    ? 'bg-gray-50 border-gray-300'
                    : 'bg-green-50 border-green-500'
                } ${onSelectStop ? 'cursor-pointer hover:shadow-xl hover:scale-105 hover:border-blue-400' : ''} ${
                  hoveredStopId === stop.id ? 'ring-2 ring-blue-200' : ''
                }`}
                  role={onSelectStop ? 'button' : undefined}
                  tabIndex={onSelectStop ? 0 : undefined}
                  onClick={() => onSelectStop && onSelectStop(stop)}
                  onMouseEnter={() => setHoveredStopId(stop.id)}
                  onMouseLeave={() => setHoveredStopId(null)}
                  onKeyDown={(e) => {
                    if (!onSelectStop) return;
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectStop(stop);
                    }
                  }}
                >
                  <div className="text-center">
                    <h5 className={`font-semibold text-sm ${
                      status === 'selected' ? 'text-blue-800' : 'text-gray-800'
                    }`}>
                      {stop.stop_name}
                    </h5>
                    <p className={`text-xs ${
                      status === 'selected' ? 'text-blue-600' : 'text-gray-600'
                    }`}>
                      {stop.location?.name || ''}
                    </p>
                    {stop.landmark && (
                      <p className="text-xs text-gray-500 mt-1">
                        Near: {stop.landmark}
                      </p>
                    )}
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 ${
                      status === 'selected'
                        ? 'bg-blue-200 text-blue-800'
                        : status === 'inactive'
                        ? 'bg-gray-200 text-gray-600'
                        : 'bg-green-200 text-green-800'
                    }`}>
                      {status === 'selected' ? 'Selected' : status === 'inactive' ? 'Inactive' : 'Available'}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Stop #{index + 1}</p>
                    {hoveredStopId === stop.id && onSelectStop && status !== 'selected' && status !== 'inactive' && (
                      <div className="text-xs text-blue-600 font-medium mt-1 animate-pulse">
                        👆 Click to select this stop
                      </div>
                    )}
                  </div>
                </div>

                {/* Stop Circle and Connector */}
                <div className="relative flex items-center">
                  <div className={`w-6 h-6 rounded-full border-2 ${getStopColor(status)} relative z-10 flex items-center justify-center`}>
                    {status === 'selected' && (
                      <div className="absolute inset-0 rounded-full bg-blue-500 animate-pulse"></div>
                    )}
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  </div>

                  {/* Horizontal Connector Line */}
                  {!isLast && (
                    <div
                      className={`w-16 h-1 ${
                        getConnectorColor(stop, route.bus_stops[index + 1])
                      }`}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Route Summary Card */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <div className="grid grid-cols-3 gap-4 text-center text-sm">
          <div>
            <p className="text-gray-600">Total Stops</p>
            <p className="font-semibold text-gray-800">{route.bus_stops.length}</p>
          </div>
          <div>
            <p className="text-gray-600">Active Stops</p>
            <p className="font-semibold text-green-600">
              {route.bus_stops.filter(stop => stop.is_active).length}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Your Stop</p>
            <p className="font-semibold text-blue-600">
              {selectedStopId ? `#${route.bus_stops.findIndex(stop => stop.id === parseInt(selectedStopId)) + 1}` : 'Not selected'}
            </p>
          </div>
        </div>

        {/* Interactive Tips */}
        {onSelectStop && (
          <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-blue-800">
                <p className="font-medium mb-1">💡 How to use:</p>
                <ul className="space-y-1 text-blue-700">
                  <li>• <strong>Click</strong> on a stop to select it as your pickup location</li>
                  <li>• <strong>Selected stop</strong> will show your provisional seat assignment</li>
                  <li>• The seat preview shows your estimated seat number and bus capacity</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default RouteVisualization;
