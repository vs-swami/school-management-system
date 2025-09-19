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
  Plus
} from 'lucide-react';

const ClassManagement = () => {
  const [selectedFeeClass, setSelectedFeeClass] = useState(null);
  const [showFeeModal, setShowFeeModal] = useState(false);
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
    console.log('ClassManagement component mounted, fetching all data...');
    fetchAllData();
  }, []);

  const handleRefresh = () => {
    fetchAllData();
  };

  const getAdmissionTypeColor = (type) => {
    switch (type) {
      case 'new': return 'bg-green-100 text-green-800';
      case 'transfer': return 'bg-blue-100 text-blue-800';
      case 'readmission': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getModeIcon = (mode) => {
    return mode === 'online' ? '💻' : '🏫';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading class data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Unable to Load Data</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-200 inline-flex items-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const sortedClasses = Object.keys(classMetrics).sort((a, b) => {
    const numA = parseInt(a) || 0;
    const numB = parseInt(b) || 0;
    return numA - numB;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Class Management</h1>
            <p className="text-gray-600">Monitor administration metrics across all classes and divisions</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-white text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition duration-200 inline-flex items-center gap-2 shadow-sm border border-gray-200"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition duration-200 inline-flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add Class
            </button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Classes</p>
                <p className="text-3xl font-bold text-gray-800">{sortedClasses.length}</p>
                <p className="text-xs text-gray-400 mt-1">{getActiveClasses()} active</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <School className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Students</p>
                <p className="text-3xl font-bold text-gray-800">{getTotalStudents()}</p>
                <p className="text-xs text-gray-400 mt-1">Across all classes</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Active Divisions</p>
                <p className="text-3xl font-bold text-gray-800">{divisions.length}</p>
                <p className="text-xs text-gray-400 mt-1">Total divisions</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">New Admissions</p>
                <p className="text-3xl font-bold text-gray-800">{getTotalNewAdmissions()}</p>
                <p className="text-xs text-gray-400 mt-1">This term</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Class Cards */}
        {sortedClasses.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <School className="w-24 h-24 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Classes Found</h3>
            <p className="text-gray-500 mb-6">Start by adding classes to your school system</p>
            <button className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition duration-200">
              Add Your First Class
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedClasses.map(classStd => {
              const metrics = classMetrics[classStd];
              const isSelected = selectedClass === classStd;

              return (
                <div
                  key={classStd}
                  className={`bg-white rounded-xl shadow-sm border transition-all duration-200 hover:shadow-lg cursor-pointer transform hover:-translate-y-1 ${
                    isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-100'
                  }`}
                  onClick={() => setSelectedClass(isSelected ? null : classStd)}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">{metrics.classInfo?.name || classStd}</h3>
                        {metrics.classInfo?.description && (
                          <p className="text-xs text-gray-500 mt-1">{metrics.classInfo.description}</p>
                        )}
                        {metrics.classInfo?.academicLevel && (
                          <p className="text-xs text-blue-600 mt-1 font-medium">{metrics.classInfo.academicLevel}</p>
                        )}
                      </div>
                      <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${
                        isSelected ? 'rotate-90' : ''
                      }`} />
                    </div>

                    {/* Compact fee display for card view */}
                    <div className="mb-3 p-2 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-semibold text-gray-600">Fee Structure</p>
                          <p className="text-sm text-gray-700">
                            Click to manage fees
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedFeeClass({
                                id: metrics.classId,
                                name: metrics.classInfo?.name || classStd
                              });
                              setShowFeeModal(true);
                            }}
                            className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                            title="Quick Edit in Modal"
                          >
                            Quick Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.location.href = `/classes/${metrics.classId}/fees`;
                            }}
                            className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                            title="Full Page Editor"
                          >
                            Full View
                          </button>
                        </div>
                      </div>
                    </div>

                    {metrics.isEmpty ? (
                      <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                        <AlertCircle className="w-12 h-12 mb-2" />
                        <p className="text-sm font-medium">No enrollments yet</p>
                        <p className="text-xs mt-1">Students will appear here once enrolled</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 text-sm">Total Students</span>
                          <span className="font-semibold text-gray-800">{metrics.totalStudents}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 text-sm">Divisions</span>
                          <span className="font-semibold text-gray-800">
                            {Object.keys(metrics.divisions).length}
                            {metrics.averagePerDivision > 0 && (
                              <span className="text-xs text-gray-500 ml-1">
                                (~{metrics.averagePerDivision}/div)
                              </span>
                            )}
                          </span>
                        </div>

                        <div className="pt-3 border-t border-gray-100">
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-gray-600">Admission Modes</span>
                          </div>
                          <div className="flex gap-4">
                            <div className="flex items-center gap-1">
                              <span className="text-lg">{getModeIcon('online')}</span>
                              <span className="text-sm font-medium">{metrics.modes.online}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-lg">{getModeIcon('offline')}</span>
                              <span className="text-sm font-medium">{metrics.modes.offline}</span>
                            </div>
                          </div>
                        </div>

                        {/* Admission type badges */}
                        <div className="flex gap-2 text-xs">
                          {metrics.admissionTypes.new > 0 && (
                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                              New: {metrics.admissionTypes.new}
                            </span>
                          )}
                          {metrics.admissionTypes.transfer > 0 && (
                            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                              Transfer: {metrics.admissionTypes.transfer}
                            </span>
                          )}
                          {metrics.admissionTypes.readmission > 0 && (
                            <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                              Readmit: {metrics.admissionTypes.readmission}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {isSelected && !metrics.isEmpty && (
                      <div className="mt-4 pt-4 border-t border-gray-100 space-y-4 animate-fade-in">
                        {/* Class Information */}
                        {metrics.classInfo?.capacity && (
                          <div className="bg-blue-50 rounded-lg p-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Capacity</span>
                              <span className="font-semibold">
                                {metrics.totalStudents} / {metrics.classInfo.capacity}
                                <span className={`ml-2 text-xs ${
                                  metrics.totalStudents >= metrics.classInfo.capacity ? 'text-red-600' : 'text-green-600'
                                }`}>
                                  ({Math.round((metrics.totalStudents / metrics.classInfo.capacity) * 100)}% full)
                                </span>
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Class Thresholds if available */}
                        {metrics.classInfo?.thresholds && metrics.classInfo.thresholds.length > 0 && (
                          <div className="bg-yellow-50 rounded-lg p-3">
                            <h5 className="text-sm font-semibold text-gray-700 mb-2">Performance Thresholds</h5>
                            <div className="space-y-1">
                              {metrics.classInfo.thresholds.map((threshold, idx) => (
                                <div key={idx} className="text-xs flex justify-between">
                                  <span className="text-gray-600">{threshold.name || `Threshold ${idx + 1}`}</span>
                                  <span className="font-medium text-gray-800">{threshold.value}%</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Class Dates */}
                        {(metrics.classInfo?.createdAt || metrics.classInfo?.updatedAt) && (
                          <div className="bg-gray-50 rounded-lg p-3 text-xs">
                            {metrics.classInfo.createdAt && (
                              <div className="flex justify-between mb-1">
                                <span className="text-gray-500">Created:</span>
                                <span className="text-gray-700">
                                  {new Date(metrics.classInfo.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                            {metrics.classInfo.updatedAt && (
                              <div className="flex justify-between">
                                <span className="text-gray-500">Last Updated:</span>
                                <span className="text-gray-700">
                                  {new Date(metrics.classInfo.updatedAt).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Division Breakdown */}
                        <div>
                          <h4 className="font-semibold text-gray-700 mb-2">Division Breakdown</h4>
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {Object.entries(metrics.divisions).map(([divName, divData]) => (
                              <div key={divName} className="bg-gray-50 rounded-lg p-3">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-medium text-gray-700">{divName}</span>
                                  <span className="text-sm font-bold text-gray-800">{divData.count} students</span>
                                </div>
                                <div className="flex gap-2 text-xs mb-2">
                                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                                    New: {divData.admissionTypes.new}
                                  </span>
                                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                    Transfer: {divData.admissionTypes.transfer}
                                  </span>
                                </div>
                                {/* Show student names if available */}
                                {divData.students && divData.students.length > 0 && (
                                  <details className="text-xs">
                                    <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                                      View students
                                    </summary>
                                    <div className="mt-2 space-y-1 pl-3">
                                      {divData.students.map((student, idx) => (
                                        <div key={idx} className="flex justify-between text-gray-600">
                                          <span>{student.name}</span>
                                          <span className="text-gray-400">GR: {student.grNo}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </details>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Recent Admissions */}
                        {metrics.recentAdmissions.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-gray-700 mb-2">Recent Admissions (Last 30 days)</h4>
                            <div className="space-y-1">
                              {metrics.recentAdmissions.map((admission, idx) => (
                                <div key={idx} className="text-sm text-gray-600 flex items-center justify-between">
                                  <span className="truncate mr-2">{admission.studentName}</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-400">{admission.daysSince}d ago</span>
                                    <span className={`text-xs px-2 py-1 rounded ${getAdmissionTypeColor(admission.type)}`}>
                                      {admission.type}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Summary Statistics */}
        {sortedClasses.length > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Summary Statistics</h2>

            {/* Financial Overview */}
            <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-3">Financial Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <span className="text-gray-600 text-sm">Total Potential Revenue (Yearly)</span>
                  <p className="text-2xl font-bold text-green-600">
                    ₹{Object.values(classMetrics).reduce((sum, cls) => sum + (cls.potentialRevenue || 0), 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600 text-sm">Average Fee per Class</span>
                  <p className="text-xl font-bold text-blue-600">
                    ₹{Math.round(
                      Object.values(classMetrics).reduce((sum, cls) => sum + (cls.classInfo?.fees?.yearly || 0), 0) /
                      (sortedClasses.length || 1)
                    ).toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600 text-sm">Total Enrolled Students</span>
                  <p className="text-xl font-bold text-purple-600">
                    {Object.values(classMetrics).reduce((sum, cls) => sum + cls.totalStudents, 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Admission Types Distribution */}
              <div>
                <h3 className="font-semibold text-gray-700 mb-3">Admission Types Distribution</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">New Admissions</span>
                    <span className="font-semibold text-green-600">
                      {Object.values(classMetrics).reduce((sum, cls) => sum + cls.admissionTypes.new, 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Transfers</span>
                    <span className="font-semibold text-blue-600">
                      {Object.values(classMetrics).reduce((sum, cls) => sum + cls.admissionTypes.transfer, 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Readmissions</span>
                    <span className="font-semibold text-yellow-600">
                      {Object.values(classMetrics).reduce((sum, cls) => sum + cls.admissionTypes.readmission, 0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Mode Distribution */}
              <div>
                <h3 className="font-semibold text-gray-700 mb-3">Mode Distribution</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Online Mode</span>
                    <span className="font-semibold text-purple-600">
                      {Object.values(classMetrics).reduce((sum, cls) => sum + cls.modes.online, 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Offline Mode</span>
                    <span className="font-semibold text-indigo-600">
                      {Object.values(classMetrics).reduce((sum, cls) => sum + cls.modes.offline, 0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Top Performing Classes */}
              <div>
                <h3 className="font-semibold text-gray-700 mb-3">Top Performing Classes</h3>
                <div className="space-y-2">
                  {sortedClasses
                    .filter(classStd => !classMetrics[classStd].isEmpty)
                    .sort((a, b) => classMetrics[b].totalStudents - classMetrics[a].totalStudents)
                    .slice(0, 3)
                    .map(classStd => (
                      <div key={classStd} className="flex items-center justify-between">
                        <span className="text-gray-600">Class {classStd}</span>
                        <span className="font-semibold text-gray-800">
                          {classMetrics[classStd].totalStudents} students
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

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
    </div>
  );
};

export default ClassManagement;
