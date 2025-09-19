import React, { useState, useEffect, useMemo } from 'react';
import {
  Bus,
  Route,
  MapPin,
  Users,
  Activity,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Navigation,
  Fuel,
  Wrench,
  Search,
  Filter,
  ChevronRight,
  Eye,
  RefreshCw,
  Compass
} from 'lucide-react';
import RouteVisualization from '../../components/students/RouteVisualization';
import Modal from '../../components/common/Modal';
import RouteManagementModal from '../../components/transport/RouteManagementModal';
import BusStopManagementModal from '../../components/transport/BusStopManagementModal';
import { BusRouteRepository } from '../../../data/repositories/BusRouteRepository';
import { BusStopRepository } from '../../../data/repositories/BusStopRepository';
import { BusRepository } from '../../../data/repositories/BusRepository';

const BusManagementDashboard = () => {
  // State Management
  const [activeTab, setActiveTab] = useState('overview');
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [busStops, setBusStops] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [selectedBus, setSelectedBus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddBusModal, setShowAddBusModal] = useState(false);
  const [showAddRouteModal, setShowAddRouteModal] = useState(false);
  const [showRouteDetails, setShowRouteDetails] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);
  const [showAddStopModal, setShowAddStopModal] = useState(false);
  const [editingStop, setEditingStop] = useState(null);

  // Load initial data
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch all data in parallel
      const [busesData, routesData, stopsData] = await Promise.all([
        BusRepository.findAll().catch(() => []),
        BusRouteRepository.findAll().catch(() => []),
        BusStopRepository.findAll().catch(() => [])
      ]);

      setBuses(busesData || []);
      setRoutes(routesData || []);
      setBusStops(stopsData || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle route save (create or update)
  const handleSaveRoute = async (routeData) => {
    await fetchDashboardData(); // Refresh data after save
    setEditingRoute(null);
  };

  // Handle route deletion
  const handleDeleteRoute = async (routeId) => {
    if (window.confirm('Are you sure you want to delete this route? This action cannot be undone.')) {
      try {
        await BusRouteRepository.delete(routeId);
        await fetchDashboardData(); // Refresh data after delete
        alert('Route deleted successfully!');
      } catch (error) {
        console.error('Error deleting route:', error);
        alert('Failed to delete route. Please try again.');
      }
    }
  };

  // Handle stop save (create or update)
  const handleSaveStop = async (stopData) => {
    await fetchDashboardData(); // Refresh data after save
    setEditingStop(null);
  };

  // Handle stop deletion
  const handleDeleteStop = async (stopId) => {
    if (window.confirm('Are you sure you want to delete this stop? This will affect all routes using this stop.')) {
      try {
        await BusStopRepository.delete(stopId);
        await fetchDashboardData(); // Refresh data after delete
        alert('Stop deleted successfully!');
      } catch (error) {
        console.error('Error deleting stop:', error);
        alert('Failed to delete stop. Please try again.');
      }
    }
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const totalBuses = buses.length;
    const activeBuses = buses.filter(b => b.status === 'active').length;
    const totalRoutes = routes.length;
    const totalStops = busStops.length;
    const totalCapacity = buses.reduce((sum, bus) => sum + (bus.total_seats || 0), 0);
    const utilizationRate = 75; // Mock data for demo

    return {
      totalBuses,
      activeBuses,
      totalRoutes,
      totalStops,
      totalCapacity,
      utilizationRate
    };
  }, [buses, routes, busStops]);

  // Filter functions
  const filteredBuses = useMemo(() => {
    return buses.filter(bus => {
      const matchesSearch = bus.bus_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           bus.driver_name?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterStatus === 'all' || bus.status === filterStatus;
      return matchesSearch && matchesFilter;
    });
  }, [buses, searchQuery, filterStatus]);

  const filteredRoutes = useMemo(() => {
    return routes.filter(route => {
      const matchesSearch = route.route_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           route.route_code?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [routes, searchQuery]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-3 rounded-xl">
                <Bus className="h-8 w-8 text-white" />
              </div>
              Bus Management Dashboard
            </h1>
            <p className="text-gray-600 mt-2">Manage your fleet, routes, and transportation operations</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowAddRouteModal(true)}
              className="bg-white border-2 border-indigo-600 text-indigo-600 px-4 py-2 rounded-lg font-semibold hover:bg-indigo-50 transition-all duration-200 flex items-center gap-2"
            >
              <Route className="h-5 w-5" />
              Add Route
            </button>
            <button
              onClick={() => setShowAddBusModal(true)}
              className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-4 py-2 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              Add Bus
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-6 border-b-2 border-gray-200">
          {['overview', 'fleet', 'routes', 'stops'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-semibold capitalize transition-all duration-200 border-b-3 ${
                activeTab === tab
                  ? 'text-indigo-600 border-b-3 border-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Statistics Cards */}
      {activeTab === 'overview' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
            {/* Total Buses */}
            <div className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Buses</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalBuses}</p>
                  <p className="text-xs text-green-600 mt-1 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {stats.activeBuses} active
                  </p>
                </div>
                <div className="bg-indigo-100 p-3 rounded-full">
                  <Bus className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
            </div>

            {/* Total Routes */}
            <div className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Routes</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalRoutes}</p>
                  <p className="text-xs text-blue-600 mt-1">Active routes</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <Route className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Total Stops */}
            <div className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Stops</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalStops}</p>
                  <p className="text-xs text-purple-600 mt-1">Pickup points</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <MapPin className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>

            {/* Total Capacity */}
            <div className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Capacity</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalCapacity}</p>
                  <p className="text-xs text-orange-600 mt-1">Seats</p>
                </div>
                <div className="bg-orange-100 p-3 rounded-full">
                  <Users className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </div>

            {/* Utilization */}
            <div className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Utilization</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.utilizationRate}%</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-gradient-to-r from-green-400 to-green-500 h-2 rounded-full"
                      style={{ width: `${stats.utilizationRate}%` }}
                    />
                  </div>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <Activity className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            {/* Maintenance */}
            <div className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Maintenance</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">2</p>
                  <p className="text-xs text-yellow-600 mt-1">Due this week</p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-full">
                  <Wrench className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Overview Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Activity className="h-5 w-5 text-indigo-600" />
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button className="w-full p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-200 hover:border-indigo-400 transition-all text-left flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <Bus className="h-5 w-5 text-indigo-600" />
                    <span className="font-medium text-gray-700">View Fleet Status</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-indigo-600" />
                </button>
                <button className="w-full p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 hover:border-green-400 transition-all text-left flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <Route className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-gray-700">Manage Routes</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-green-600" />
                </button>
                <button className="w-full p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200 hover:border-purple-400 transition-all text-left flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-purple-600" />
                    <span className="font-medium text-gray-700">Edit Bus Stops</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-purple-600" />
                </button>
                <button className="w-full p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border border-orange-200 hover:border-orange-400 transition-all text-left flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <Wrench className="h-5 w-5 text-orange-600" />
                    <span className="font-medium text-gray-700">Schedule Maintenance</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-orange-600" />
                </button>
              </div>
            </div>

            {/* Recent Activities */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-indigo-600" />
                Recent Activities
              </h3>
              <div className="space-y-3">
                {[
                  { icon: CheckCircle, color: 'green', text: 'Bus B-101 completed morning route', time: '2 hours ago' },
                  { icon: AlertTriangle, color: 'yellow', text: 'Bus B-105 scheduled for maintenance', time: '5 hours ago' },
                  { icon: Plus, color: 'blue', text: 'New route "North Circuit" added', time: '1 day ago' },
                  { icon: Edit, color: 'purple', text: 'Stop "Main Square" location updated', time: '2 days ago' },
                ].map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50">
                    <div className={`bg-${activity.color}-100 p-2 rounded-full`}>
                      <activity.icon className={`h-4 w-4 text-${activity.color}-600`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-700">{activity.text}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Fleet Management Tab */}
      {activeTab === 'fleet' && (
        <div className="space-y-6">
          {/* Search and Filter Bar */}
          <div className="bg-white rounded-xl shadow-md p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by bus number or driver..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="maintenance">Maintenance</option>
                <option value="inactive">Inactive</option>
              </select>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
            </div>
          </div>

          {/* Bus Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBuses.map((bus) => (
              <BusCard
                key={bus.id}
                bus={bus}
                onEdit={() => setSelectedBus(bus)}
                onDelete={() => console.log('Delete bus:', bus.id)}
                onViewDetails={() => setSelectedBus(bus)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Routes Management Tab */}
      {activeTab === 'routes' && (
        <div className="space-y-6">
          {/* Search Bar */}
          <div className="bg-white rounded-xl shadow-md p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search routes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Routes List with Visualization */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Routes List */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">All Routes</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredRoutes.map((route) => (
                  <div
                    key={route.id}
                    onClick={() => setSelectedRoute(route)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedRoute?.id === route.id
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-800">{route.route_name}</h4>
                        <p className="text-sm text-gray-600">Code: {route.route_code}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs">
                          <span className="flex items-center gap-1">
                            <Bus className="h-3 w-3" />
                            {route.bus?.bus_number || 'No bus assigned'}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {route.bus_stops?.length || 0} stops
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingRoute(route);
                            setShowAddRouteModal(true);
                          }}
                          className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteRoute(route.id);
                          }}
                          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Route Visualization */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Route Visualization</h3>
              {selectedRoute ? (
                <RouteVisualization
                  route={selectedRoute}
                  routeType="pickup"
                  onSelectStop={(stop) => console.log('Selected stop:', stop)}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                  <Route className="h-12 w-12 mb-3" />
                  <p className="text-center">Select a route to view its visualization</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bus Stops Tab */}
      {activeTab === 'stops' && (
        <div className="space-y-6">
          {/* Header with Add Button */}
          <div className="bg-white rounded-xl shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-800">Bus Stops Management</h3>
                <p className="text-sm text-gray-600 mt-1">Manage pickup and drop-off points</p>
              </div>
              <button
                onClick={() => {
                  setEditingStop(null);
                  setShowAddStopModal(true);
                }}
                className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white px-4 py-2 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
              >
                <Plus className="h-5 w-5" />
                Add Stop
              </button>
            </div>
          </div>

          {/* Stops Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {busStops.map((stop) => (
              <div key={stop.id} className="bg-white p-5 rounded-lg border border-gray-200 hover:border-green-300 hover:shadow-lg transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 text-lg">{stop.stop_name}</h4>
                    {stop.landmark && (
                      <p className="text-xs text-gray-500 mt-1">Near {stop.landmark}</p>
                    )}
                  </div>
                  <div className={`p-2 rounded-full ${
                    stop.is_active !== false ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    <MapPin className={`h-5 w-5 ${
                      stop.is_active !== false ? 'text-green-600' : 'text-gray-400'
                    }`} />
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Navigation className="h-4 w-4" />
                    <span>Location: {stop.location?.name || 'GPS Coordinates'}</span>
                  </div>

                  {(stop.latitude && stop.longitude) && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Compass className="h-4 w-4" />
                      <span className="text-xs">
                        {parseFloat(stop.latitude).toFixed(4)}, {parseFloat(stop.longitude).toFixed(4)}
                      </span>
                    </div>
                  )}

                  {stop.pickup_time && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>Pickup: {stop.pickup_time}</span>
                    </div>
                  )}

                  {stop.estimated_students > 0 && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="h-4 w-4" />
                      <span>~{stop.estimated_students} students</span>
                    </div>
                  )}

                  {stop.distance_from_school && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Route className="h-4 w-4" />
                      <span>{stop.distance_from_school} km from school</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t">
                  <button
                    onClick={() => {
                      setEditingStop(stop);
                      setShowAddStopModal(true);
                    }}
                    className="flex-1 py-2 text-sm bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 font-medium flex items-center justify-center gap-1"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteStop(stop.id)}
                    className="flex-1 py-2 text-sm bg-red-100 text-red-600 rounded-lg hover:bg-red-200 font-medium flex items-center justify-center gap-1"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))}

            {busStops.length === 0 && (
              <div className="col-span-full text-center py-12 text-gray-500">
                <MapPin className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-lg font-medium">No stops created yet</p>
                <p className="text-sm mt-1">Click "Add Stop" to create your first bus stop</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Route Management Modal */}
      <RouteManagementModal
        isOpen={showAddRouteModal}
        onClose={() => {
          setShowAddRouteModal(false);
          setEditingRoute(null);
        }}
        route={editingRoute}
        onSave={handleSaveRoute}
      />

      {/* Bus Stop Management Modal */}
      <BusStopManagementModal
        isOpen={showAddStopModal}
        onClose={() => {
          setShowAddStopModal(false);
          setEditingStop(null);
        }}
        stop={editingStop}
        onSave={handleSaveStop}
      />
    </div>
  );
};

// Bus Card Component
const BusCard = ({ bus, onEdit, onDelete, onViewDetails }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 border-green-300';
      case 'maintenance': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'inactive': return 'bg-red-100 text-red-700 border-red-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-6 border-2 border-gray-100">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-100 p-3 rounded-full">
            <Bus className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">{bus.bus_number || 'Bus ' + bus.id}</h3>
            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(bus.status || 'active')}`}>
              {bus.status || 'Active'}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={onEdit} className="p-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200">
            <Edit className="h-4 w-4" />
          </button>
          <button onClick={onDelete} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-gray-600">
          <Users className="h-4 w-4" />
          <span>Capacity: {bus.total_seats || 50} seats</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <Route className="h-4 w-4" />
          <span>Route: {bus.current_route || 'Not assigned'}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <Fuel className="h-4 w-4" />
          <span>Fuel: {bus.fuel_level || '75'}%</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <Calendar className="h-4 w-4" />
          <span>Next Maintenance: {bus.next_maintenance || 'In 15 days'}</span>
        </div>
      </div>

      <button
        onClick={onViewDetails}
        className="w-full mt-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:from-indigo-700 hover:to-blue-700 transition-all font-semibold"
      >
        View Details
      </button>
    </div>
  );
};

export default BusManagementDashboard;