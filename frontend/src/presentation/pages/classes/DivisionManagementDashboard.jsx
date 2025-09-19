import React, { useState, useEffect, useMemo } from 'react';
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
  Edit,
  Trash2,
  MapPin,
  Home,
  UserPlus,
  GraduationCap,
  ChevronDown
} from 'lucide-react';
import useDivisionStore from '../../../application/stores/useDivisionStore';
import { DivisionRepository } from '../../../data/repositories/DivisionRepository';
import FeeManagementModal from '../../components/fees/FeeManagementModal';

const DivisionManagementDashboard = () => {
  // State Management
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedDivision, setSelectedDivision] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterYearGroup, setFilterYearGroup] = useState('all');
  const [showAddDivisionModal, setShowAddDivisionModal] = useState(false);
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [selectedFeeClass, setSelectedFeeClass] = useState(null);

  // Store data
  const {
    divisions,
    divisionMetrics,
    yearGroups,
    loading,
    error,
    fetchDivisionsWithMetrics,
    fetchYearGroups,
    getSummaryStats,
    getDivisionsByYearLevel
  } = useDivisionStore();

  // Load initial data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    await Promise.all([
      fetchDivisionsWithMetrics(),
      fetchYearGroups()
    ]);
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const summaryStats = getSummaryStats();
    const divisionsByYear = getDivisionsByYearLevel();

    return {
      ...summaryStats,
      yearGroupCount: Object.keys(divisionsByYear).length,
      largestDivision: Object.values(divisionMetrics).reduce((max, div) =>
        (div.enrollment?.total || 0) > (max.enrollment?.total || 0) ? div : max,
        { enrollment: { total: 0 } }
      )
    };
  }, [divisionMetrics]);

  // Filter divisions based on search and year group
  const filteredDivisions = useMemo(() => {
    return Object.values(divisionMetrics).filter(division => {
      if (!division.divisionInfo) return false;

      const matchesSearch = searchQuery === '' ||
        division.divisionInfo.name.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesYearGroup = filterYearGroup === 'all' ||
        division.divisionInfo.yearLevel === filterYearGroup;

      return matchesSearch && matchesYearGroup;
    });
  }, [divisionMetrics, searchQuery, filterYearGroup]);

  // Get unique year groups for filter
  const yearGroupOptions = useMemo(() => {
    const groups = new Set();
    Object.values(divisionMetrics).forEach(division => {
      if (division.divisionInfo?.yearLevel) {
        groups.add(division.divisionInfo.yearLevel);
      }
    });
    return Array.from(groups).sort();
  }, [divisionMetrics]);

  const getStatusColor = (enrollmentCount) => {
    if (enrollmentCount >= 40) return 'text-red-600 bg-red-100';
    if (enrollmentCount >= 30) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getGenderColor = (percentage) => {
    if (percentage >= 60) return 'bg-blue-500';
    if (percentage >= 40) return 'bg-pink-500';
    return 'bg-gray-500';
  };

  if (loading && Object.keys(divisionMetrics).length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading division data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Unable to Load Data</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchData}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-200 inline-flex items-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Division Management</h1>
              <p className="text-gray-600 mt-1">Manage class divisions and student distribution</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={fetchData}
                className="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition duration-200 inline-flex items-center gap-2 shadow-sm border border-gray-200"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <button
                onClick={() => setShowAddDivisionModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition duration-200 inline-flex items-center gap-2 shadow-lg"
              >
                <Plus className="w-4 h-4" />
                Add Division
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {['overview', 'divisions', 'analytics', 'yearGroups'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
                }`}
              >
                {tab === 'overview' && 'Overview'}
                {tab === 'divisions' && 'Divisions'}
                {tab === 'analytics' && 'Analytics'}
                {tab === 'yearGroups' && 'Year Groups'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <School className="h-6 w-6 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-green-600">Active</span>
                </div>
                <p className="text-2xl font-bold text-gray-800">{stats.totalDivisions}</p>
                <p className="text-sm text-gray-600 mt-1">Total Divisions</p>
                <div className="mt-3 text-xs text-gray-500">
                  {stats.yearGroupCount} Year Groups
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-blue-600">
                    {stats.averageClassSize} avg
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-800">{stats.totalStudents}</p>
                <p className="text-sm text-gray-600 mt-1">Total Students</p>
                <div className="mt-3 flex justify-between text-xs">
                  <span className="text-blue-600">♂ {stats.genderDistribution.male}</span>
                  <span className="text-pink-600">♀ {stats.genderDistribution.female}</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <Bus className="h-6 w-6 text-purple-600" />
                  </div>
                  <span className="text-sm font-medium text-purple-600">
                    {stats.transportPercentage}%
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-800">{stats.transportUsers}</p>
                <p className="text-sm text-gray-600 mt-1">Transport Users</p>
                <div className="mt-3 text-xs text-gray-500">
                  Across all divisions
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-yellow-100 p-3 rounded-lg">
                    <Target className="h-6 w-6 text-yellow-600" />
                  </div>
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.largestDivision?.divisionInfo?.name || 'N/A'}
                </p>
                <p className="text-sm text-gray-600 mt-1">Largest Division</p>
                <div className="mt-3 text-xs text-gray-500">
                  {stats.largestDivision?.enrollment?.total || 0} students
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg hover:from-blue-100 hover:to-indigo-100 transition-all">
                  <UserPlus className="h-6 w-6 text-blue-600 mb-2" />
                  <p className="text-sm font-medium text-gray-700">Add Students</p>
                </button>
                <button className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg hover:from-green-100 hover:to-emerald-100 transition-all">
                  <FileText className="h-6 w-6 text-green-600 mb-2" />
                  <p className="text-sm font-medium text-gray-700">Generate Reports</p>
                </button>
                <button className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg hover:from-purple-100 hover:to-pink-100 transition-all">
                  <Award className="h-6 w-6 text-purple-600 mb-2" />
                  <p className="text-sm font-medium text-gray-700">View Performance</p>
                </button>
                <button className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg hover:from-yellow-100 hover:to-orange-100 transition-all">
                  <DollarSign className="h-6 w-6 text-yellow-600 mb-2" />
                  <p className="text-sm font-medium text-gray-700">Manage Fees</p>
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {Object.values(divisionMetrics).slice(0, 5).map(division => {
                  const recentAdmissions = division.recentActivity?.newAdmissions || [];
                  if (recentAdmissions.length === 0) return null;

                  return recentAdmissions.slice(0, 1).map(admission => (
                    <div key={`${division.divisionInfo.id}-${admission.grNo}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            {admission.studentName} enrolled in {division.divisionInfo.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            GR: {admission.grNo} • {admission.daysSince} days ago
                          </p>
                        </div>
                      </div>
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                        {admission.admissionType}
                      </span>
                    </div>
                  ));
                })}
              </div>
            </div>
          </div>
        )}

        {/* Divisions Tab */}
        {activeTab === 'divisions' && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="bg-white rounded-xl shadow-lg p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search divisions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <select
                  value={filterYearGroup}
                  onChange={(e) => setFilterYearGroup(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Year Groups</option>
                  {yearGroupOptions.map(group => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Divisions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDivisions.map(division => (
                <div
                  key={division.divisionInfo.id}
                  className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer border border-gray-100"
                  onClick={() => setSelectedDivision(division.divisionInfo.id)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">
                        {division.divisionInfo.name}
                      </h3>
                      <p className="text-sm text-gray-500">{division.divisionInfo.yearLevel}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(division.enrollment.total)}`}>
                      {division.enrollment.total} students
                    </span>
                  </div>

                  {/* Gender Distribution Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Gender Distribution</span>
                      <span>{division.demographics.gender.ratio}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 flex overflow-hidden">
                      <div
                        className="bg-blue-500 h-2"
                        style={{ width: `${division.demographics.gender.percentages.male}%` }}
                      ></div>
                      <div
                        className="bg-pink-500 h-2"
                        style={{ width: `${division.demographics.gender.percentages.female}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Transport Users</span>
                      <span className="font-medium">{division.demographics.transport.count} ({division.demographics.transport.percentage}%)</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Houses</span>
                      <span className="font-medium">{Object.keys(division.academic.houses || {}).length}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Recent Admissions</span>
                      <span className="font-medium">{division.recentActivity.newAdmissions.length}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-4 pt-4 border-t">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // View details
                      }}
                      className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm font-medium"
                    >
                      <Eye className="w-4 h-4 inline mr-1" />
                      View
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Manage fees
                      }}
                      className="flex-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm font-medium"
                    >
                      <DollarSign className="w-4 h-4 inline mr-1" />
                      Fees
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredDivisions.length === 0 && (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <School className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Divisions Found</h3>
                <p className="text-gray-500">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Gender Distribution */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Gender Distribution</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-blue-500 rounded"></div>
                      <span className="text-gray-700">Male Students</span>
                    </div>
                    <span className="font-bold text-gray-800">{stats.genderDistribution.male}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-pink-500 rounded"></div>
                      <span className="text-gray-700">Female Students</span>
                    </div>
                    <span className="font-bold text-gray-800">{stats.genderDistribution.female}</span>
                  </div>
                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-600">Gender Ratio</p>
                    <p className="text-2xl font-bold text-gray-800">{stats.genderDistribution.ratio}</p>
                  </div>
                </div>
              </div>

              {/* Transport Analysis */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Transport Analysis</h3>
                <div className="space-y-4">
                  {Object.values(divisionMetrics).map(division => (
                    <div key={division.divisionInfo.id} className="flex items-center justify-between">
                      <span className="text-gray-700">{division.divisionInfo.name}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-purple-600 h-2 rounded-full"
                            style={{ width: `${division.demographics.transport.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-600 w-12 text-right">
                          {division.demographics.transport.percentage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Location Distribution */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Location Distribution</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.values(divisionMetrics).slice(0, 1).map(division =>
                  Object.entries(division.demographics.location || {}).map(([location, data]) => (
                    <div key={location} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <p className="text-sm font-medium text-gray-700">{location}</p>
                      </div>
                      <p className="text-xl font-bold text-gray-800">{data.count}</p>
                      <p className="text-xs text-gray-500">students</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Year Groups Tab */}
        {activeTab === 'yearGroups' && (
          <div className="space-y-6">
            {Object.entries(yearGroups).map(([yearLevel, group]) => (
              <div key={yearLevel} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{yearLevel}</h3>
                    <p className="text-sm text-gray-500">
                      {group.divisions.length} divisions • {group.totalStudents} students
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Average Class Size</p>
                    <p className="text-2xl font-bold text-gray-800">{group.avgClassSize}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {group.divisions.map(div => (
                    <div key={div.name} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-700">{div.name}</span>
                        <span className="text-sm px-2 py-1 bg-blue-100 text-blue-700 rounded">
                          {div.studentCount} students
                        </span>
                      </div>
                      <div className="space-y-1 text-xs text-gray-600">
                        <p>Gender: {div.genderRatio}</p>
                        <p>Transport: {div.transportPercentage}%</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-600">
                      Gender Balance: <span className="font-medium">{group.genderRatio}</span>
                    </span>
                    <span className="text-gray-600">
                      Transport Usage: <span className="font-medium">{group.transportPercentage}%</span>
                    </span>
                  </div>
                  <button className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm font-medium">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fee Management Modal */}
      {showFeeModal && (
        <FeeManagementModal
          isOpen={showFeeModal}
          onClose={() => {
            setShowFeeModal(false);
            setSelectedFeeClass(null);
          }}
          classId={selectedFeeClass?.id}
          className={selectedFeeClass?.name}
        />
      )}
    </div>
  );
};

export default DivisionManagementDashboard;