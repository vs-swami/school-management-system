import React, { useEffect, useState } from 'react';
import { useClassStore } from '../../../application/stores/useClassStore';
import FeeManagementModal from '../../components/fees/FeeManagementModal';
import {
  Users,
  BookOpen,
  TrendingUp,
  Award,
  Calendar,
  ChevronRight,
  BarChart3,
  PieChart,
  AlertCircle,
  School,
  RefreshCw,
  Plus,
  DollarSign,
  Bus,
  UserCheck,
  Clock,
  Target,
  Activity,
  FileText,
  Eye,
  Settings,
  Download,
  Filter,
  Search,
  Grid,
  List,
  ChevronDown,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  UserPlus,
  GraduationCap,
  MapPin,
  Percent,
  TrendingDown,
  Info
} from 'lucide-react';

const EnhancedClassManagement = () => {
  const [selectedFeeClass, setSelectedFeeClass] = useState(null);
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [showFilters, setShowFilters] = useState(false);

  const {
    classes,
    divisions,
    classMetrics,
    loading,
    error,
    selectedClass,
    fetchAllData,
    setSelectedClass,
    getTotalStudents,
    getTotalNewAdmissions,
    getActiveClasses
  } = useClassStore();

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleRefresh = () => {
    fetchAllData();
  };

  // Mock data for enhanced features (would come from backend)
  const enhancedMetrics = {
    attendance: {
      today: 92,
      weekly: 88,
      monthly: 90
    },
    performance: {
      average: 75,
      topScorer: 'John Doe',
      improvement: 5
    },
    fees: {
      collected: 850000,
      pending: 150000,
      defaulters: 12
    },
    transport: {
      users: 145,
      routes: 8
    },
    teachers: {
      assigned: 12,
      ratio: '1:25'
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      full: 'bg-red-100 text-red-800',
      available: 'bg-blue-100 text-blue-800'
    };
    return badges[status] || badges.active;
  };

  const getPerformanceColor = (value) => {
    if (value >= 80) return 'text-green-600';
    if (value >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredClasses = Object.keys(classMetrics)
    .filter(cls => {
      if (searchTerm && !cls.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      if (filterStatus !== 'all') {
        // Add filter logic based on status
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.localeCompare(b);
        case 'students':
          return classMetrics[b].totalStudents - classMetrics[a].totalStudents;
        case 'performance':
          // Sort by performance metrics
          return 0;
        default:
          return 0;
      }
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mx-auto"></div>
            <div className="animate-ping absolute inset-0 rounded-full h-16 w-16 border-4 border-indigo-400 opacity-20 mx-auto"></div>
          </div>
          <p className="text-gray-600 mt-4 font-medium">Loading class data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl max-w-md">
          <div className="bg-red-100 rounded-full p-3 w-fit mx-auto mb-4">
            <AlertCircle className="w-12 h-12 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Unable to Load Data</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 inline-flex items-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Enhanced Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Class Management Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Comprehensive overview of all classes and academic metrics
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search classes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* View Mode Toggle */}
              <div className="bg-gray-100 rounded-xl p-1 flex">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    viewMode === 'grid'
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    viewMode === 'list'
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>

              {/* Filter Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 bg-white text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition duration-200 inline-flex items-center gap-2 shadow-sm border border-gray-200"
              >
                <Filter className="w-4 h-4" />
                Filters
                <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>

              {/* Action Buttons */}
              <button
                onClick={handleRefresh}
                className="px-4 py-2 bg-white text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition duration-200 inline-flex items-center gap-2 shadow-sm border border-gray-200"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>

              <button className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 inline-flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Class
              </button>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Status</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="all">All Classes</option>
                    <option value="active">Active</option>
                    <option value="full">Full Capacity</option>
                    <option value="available">Seats Available</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="name">Class Name</option>
                    <option value="students">Student Count</option>
                    <option value="performance">Performance</option>
                    <option value="fees">Fee Collection</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Academic Year</label>
                  <select className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option>2024-2025</option>
                    <option>2023-2024</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Division</label>
                  <select className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="">All Divisions</option>
                    {divisions.map(div => (
                      <option key={div.id} value={div.id}>{div.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Enhanced Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {/* Total Classes Card */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-xl group-hover:scale-110 transition-transform">
                <School className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                +12%
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-800">{filteredClasses.length}</p>
            <p className="text-sm text-gray-500 mt-1">Total Classes</p>
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Active</span>
                <span className="font-medium text-gray-700">{getActiveClasses()}</span>
              </div>
            </div>
          </div>

          {/* Total Students Card */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-3 rounded-xl group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                +8%
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-800">{getTotalStudents()}</p>
            <p className="text-sm text-gray-500 mt-1">Total Students</p>
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">New</span>
                <span className="font-medium text-gray-700">{getTotalNewAdmissions()}</span>
              </div>
            </div>
          </div>

          {/* Attendance Card */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-3 rounded-xl group-hover:scale-110 transition-transform">
                <UserCheck className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-medium text-red-600 bg-red-100 px-2 py-1 rounded-full">
                -2%
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-800">{enhancedMetrics.attendance.today}%</p>
            <p className="text-sm text-gray-500 mt-1">Today's Attendance</p>
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Weekly</span>
                <span className="font-medium text-gray-700">{enhancedMetrics.attendance.weekly}%</span>
              </div>
            </div>
          </div>

          {/* Fee Collection Card */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gradient-to-br from-yellow-500 to-orange-600 p-3 rounded-xl group-hover:scale-110 transition-transform">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                85%
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-800">₹{(enhancedMetrics.fees.collected / 1000).toFixed(0)}K</p>
            <p className="text-sm text-gray-500 mt-1">Fees Collected</p>
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Pending</span>
                <span className="font-medium text-orange-600">₹{(enhancedMetrics.fees.pending / 1000).toFixed(0)}K</span>
              </div>
            </div>
          </div>

          {/* Performance Card */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-3 rounded-xl group-hover:scale-110 transition-transform">
                <Target className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                +{enhancedMetrics.performance.improvement}%
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-800">{enhancedMetrics.performance.average}%</p>
            <p className="text-sm text-gray-500 mt-1">Avg Performance</p>
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-600 h-2 rounded-full"
                  style={{ width: `${enhancedMetrics.performance.average}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Bar */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-8 border border-gray-100">
          <div className="flex flex-wrap gap-3">
            <button className="px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 font-medium rounded-xl hover:shadow-md transition-all duration-200 inline-flex items-center gap-2 border border-indigo-200">
              <FileText className="w-4 h-4" />
              Generate Report
            </button>
            <button className="px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 font-medium rounded-xl hover:shadow-md transition-all duration-200 inline-flex items-center gap-2 border border-green-200">
              <Download className="w-4 h-4" />
              Export Data
            </button>
            <button className="px-4 py-2 bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 font-medium rounded-xl hover:shadow-md transition-all duration-200 inline-flex items-center gap-2 border border-blue-200">
              <UserPlus className="w-4 h-4" />
              Bulk Enrollment
            </button>
            <button className="px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 font-medium rounded-xl hover:shadow-md transition-all duration-200 inline-flex items-center gap-2 border border-purple-200">
              <Calendar className="w-4 h-4" />
              Schedule Exam
            </button>
            <button className="px-4 py-2 bg-gradient-to-r from-yellow-50 to-orange-50 text-yellow-700 font-medium rounded-xl hover:shadow-md transition-all duration-200 inline-flex items-center gap-2 border border-yellow-200">
              <Award className="w-4 h-4" />
              Performance Analysis
            </button>
          </div>
        </div>

        {/* Class Cards Grid/List View */}
        {filteredClasses.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-16 text-center">
            <div className="bg-gray-100 rounded-full p-6 w-fit mx-auto mb-6">
              <School className="w-16 h-16 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-700 mb-3">No Classes Found</h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              {searchTerm
                ? `No classes match your search "${searchTerm}"`
                : 'Start by adding classes to your school system'
              }
            </p>
            <button className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200">
              Add Your First Class
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClasses.map(classStd => {
              const metrics = classMetrics[classStd];
              const isSelected = selectedClass === classStd;
              const capacity = metrics.classInfo?.capacity || 60;
              const occupancyRate = (metrics.totalStudents / capacity) * 100;

              return (
                <div
                  key={classStd}
                  className={`bg-white rounded-2xl shadow-sm border transition-all duration-300 hover:shadow-xl cursor-pointer transform hover:-translate-y-1 ${
                    isSelected ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-gray-100'
                  }`}
                  onClick={() => setSelectedClass(isSelected ? null : classStd)}
                >
                  {/* Card Header */}
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-800 mb-1">
                          Class {metrics.classInfo?.name || classStd}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            occupancyRate >= 90 ? 'bg-red-100 text-red-700' :
                            occupancyRate >= 70 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {occupancyRate >= 90 ? 'Almost Full' :
                             occupancyRate >= 70 ? 'Filling Up' : 'Available'}
                          </span>
                          {metrics.totalStudents > 0 && (
                            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                              {Object.keys(metrics.divisions).length} Divisions
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // Show dropdown menu
                          }}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <MoreVertical className="w-5 h-5 text-gray-500" />
                        </button>
                      </div>
                    </div>

                    {/* Quick Stats Row */}
                    <div className="grid grid-cols-3 gap-3 mt-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-800">{metrics.totalStudents}</p>
                        <p className="text-xs text-gray-500">Students</p>
                      </div>
                      <div className="text-center border-x border-gray-100">
                        <p className="text-2xl font-bold text-indigo-600">{enhancedMetrics.attendance.today}%</p>
                        <p className="text-xs text-gray-500">Attendance</p>
                      </div>
                      <div className="text-center">
                        <p className={`text-2xl font-bold ${getPerformanceColor(enhancedMetrics.performance.average)}`}>
                          {enhancedMetrics.performance.average}%
                        </p>
                        <p className="text-xs text-gray-500">Performance</p>
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6">
                    {metrics.isEmpty ? (
                      <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                        <AlertCircle className="w-12 h-12 mb-3" />
                        <p className="text-sm font-medium">No enrollments yet</p>
                        <button className="mt-4 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors">
                          Add Students
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Capacity Bar */}
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-600">Capacity</span>
                            <span className="text-sm font-medium text-gray-800">
                              {metrics.totalStudents}/{capacity}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-500 ${
                                occupancyRate >= 90 ? 'bg-red-500' :
                                occupancyRate >= 70 ? 'bg-yellow-500' :
                                'bg-green-500'
                              }`}
                              style={{ width: `${Math.min(occupancyRate, 100)}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Gender Distribution */}
                        <div>
                          <p className="text-sm text-gray-600 mb-2">Gender Distribution</p>
                          <div className="flex gap-4">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                              <span className="text-sm">Boys: 60%</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                              <span className="text-sm">Girls: 40%</span>
                            </div>
                          </div>
                        </div>

                        {/* Transport & Fee Status */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-3 rounded-xl">
                            <div className="flex items-center gap-2">
                              <Bus className="w-4 h-4 text-blue-600" />
                              <div>
                                <p className="text-xs text-gray-600">Transport</p>
                                <p className="text-sm font-semibold text-gray-800">
                                  {Math.round(metrics.totalStudents * 0.3)} students
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-xl">
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4 text-green-600" />
                              <div>
                                <p className="text-xs text-gray-600">Fees Paid</p>
                                <p className="text-sm font-semibold text-gray-800">85%</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedFeeClass({
                                id: metrics.classId,
                                name: metrics.classInfo?.name || classStd
                              });
                              setShowFeeModal(true);
                            }}
                            className="flex-1 px-3 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                          >
                            Manage Fees
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.location.href = `/classes/${metrics.classId}/details`;
                            }}
                            className="flex-1 px-3 py-2 bg-white text-indigo-600 text-sm font-medium rounded-lg border border-indigo-200 hover:bg-indigo-50 transition-colors"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Expandable Details */}
                  {isSelected && !metrics.isEmpty && (
                    <div className="px-6 pb-6 pt-0 border-t border-gray-100 animate-fade-in">
                      <div className="mt-4 space-y-4">
                        {/* Division Breakdown */}
                        <div>
                          <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <BarChart3 className="w-4 h-4" />
                            Division Performance
                          </h4>
                          <div className="space-y-2">
                            {Object.entries(metrics.divisions).map(([divName, divData]) => (
                              <div key={divName} className="bg-gray-50 rounded-lg p-3">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-medium text-gray-700">{divName}</span>
                                  <div className="flex items-center gap-3">
                                    <span className="text-sm text-gray-600">{divData.count} students</span>
                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                  </div>
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-xs">
                                  <div className="flex items-center gap-1">
                                    <UserCheck className="w-3 h-3 text-green-600" />
                                    <span>Attendance: 92%</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Target className="w-3 h-3 text-blue-600" />
                                    <span>Avg: 75%</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <DollarSign className="w-3 h-3 text-yellow-600" />
                                    <span>Fees: 80%</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Recent Activities */}
                        <div>
                          <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <Activity className="w-4 h-4" />
                            Recent Activities
                          </h4>
                          <div className="space-y-2">
                            <div className="flex items-center gap-3 text-sm">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-gray-600">3 new admissions this week</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span className="text-gray-600">Exam scheduled for next month</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                              <span className="text-gray-600">2 pending fee payments</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          // List View
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Class
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Students
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Divisions
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Attendance
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Fee Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredClasses.map(classStd => {
                  const metrics = classMetrics[classStd];
                  return (
                    <tr key={classStd} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg mr-3">
                            <School className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              Class {metrics.classInfo?.name || classStd}
                            </div>
                            <div className="text-xs text-gray-500">
                              ID: {metrics.classId}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{metrics.totalStudents}</div>
                        <div className="text-xs text-gray-500">
                          {metrics.admissionTypes.new} new
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                          {Object.keys(metrics.divisions).length}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-900">
                            {enhancedMetrics.attendance.today}%
                          </span>
                          <TrendingUp className="w-3 h-3 text-green-500 ml-2" />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-2 mr-2 max-w-[60px]">
                            <div
                              className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full"
                              style={{ width: `${enhancedMetrics.performance.average}%` }}
                            ></div>
                          </div>
                          <span className={`text-sm font-medium ${getPerformanceColor(enhancedMetrics.performance.average)}`}>
                            {enhancedMetrics.performance.average}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                          85% Paid
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedFeeClass({
                              id: metrics.classId,
                              name: metrics.classInfo?.name || classStd
                            })}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="text-gray-600 hover:text-gray-900">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="text-gray-600 hover:text-gray-900">
                            <Settings className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Enhanced Summary Dashboard */}
        {filteredClasses.length > 0 && (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Trends Chart */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">Performance Trends</h3>
                <select className="text-sm px-3 py-1 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option>Last 7 Days</option>
                  <option>Last Month</option>
                  <option>Last Quarter</option>
                </select>
              </div>
              <div className="h-64 flex items-center justify-center text-gray-400">
                <Activity className="w-8 h-8" />
                <span className="ml-2">Chart Component Here</span>
              </div>
            </div>

            {/* Top Performers */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">Top Performing Classes</h3>
                <Award className="w-5 h-5 text-yellow-500" />
              </div>
              <div className="space-y-3">
                {filteredClasses
                  .slice(0, 5)
                  .map((classStd, index) => (
                    <div key={classStd} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm
                          ${index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                            index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-600' :
                            index === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-600' :
                            'bg-gradient-to-r from-indigo-400 to-purple-600'}`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">Class {classStd}</p>
                          <p className="text-xs text-gray-500">
                            {classMetrics[classStd].totalStudents} students
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">{85 - index * 3}%</p>
                        <p className="text-xs text-gray-500">Avg Score</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Fee Management Modal */}
      <FeeManagementModal
        isOpen={showFeeModal}
        onClose={() => {
          setShowFeeModal(false);
          setSelectedFeeClass(null);
        }}
        classId={selectedFeeClass?.id}
        className={selectedFeeClass?.name}
      />
    </div>
  );
};

export default EnhancedClassManagement;