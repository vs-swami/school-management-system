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
  ChevronDown,
  Percent,
  Trophy,
  TrendingDown,
  BookOpenCheck,
  MoreVertical
} from 'lucide-react';
import { useClassStore } from '../../../application/stores/useClassStore';
import useDivisionStore from '../../../application/stores/useDivisionStore';
import { DivisionRepository } from '../../../data/repositories/DivisionRepository';
import { ClassRepository } from '../../../data/repositories/ClassRepository';
import FeeManagementModal from '../../components/fees/FeeManagementModal';

const ClassDivisionDashboard = () => {
  // State Management
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedDivision, setSelectedDivision] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedClass, setExpandedClass] = useState(null);
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [selectedFeeClass, setSelectedFeeClass] = useState(null);

  // Store data
  const {
    classes,
    classMetrics,
    loading: classLoading,
    error: classError,
    fetchAllData: fetchClassData
  } = useClassStore();

  const {
    divisionMetrics,
    yearGroups,
    loading: divisionLoading,
    error: divisionError,
    fetchDivisionsWithMetrics,
    fetchYearGroups
  } = useDivisionStore();

  // Load initial data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    await Promise.all([
      fetchClassData(),
      fetchDivisionsWithMetrics(),
      fetchYearGroups()
    ]);
  };

  // Group divisions by class
  const classDivisionData = useMemo(() => {
    const grouped = {};

    console.log('=== Building Class Division Data ===');
    console.log('Classes:', classes.length, 'items');
    console.log('Class Metrics keys:', Object.keys(classMetrics));

    // Log Nursery specific data if present
    if (classMetrics['Nursery']) {
      console.log('Found Nursery in metrics:', {
        totalStudents: classMetrics['Nursery'].totalStudents,
        enrolledStudents: classMetrics['Nursery'].enrolledStudents?.length,
        divisions: Object.keys(classMetrics['Nursery'].divisions || {})
      });
    }

    // Initialize with ALL classes from the system
    classes.forEach(cls => {
      const className = cls.classname || cls.name || `Class ${cls.id}`;
      grouped[className] = {
        classInfo: {
          id: cls.id,
          name: className,
          ...cls
        },
        classMetrics: classMetrics[className] || {},
        divisions: [],
        totalStudents: 0,
        totalMale: 0,
        totalFemale: 0,
        totalTransport: 0,
        avgPerformance: 0,
        passRate: 0,
        enrolledStudents: []
      };
    });

    // Merge data from classMetrics which contains actual enrollment data
    Object.keys(classMetrics).forEach(classStd => {
      if (!grouped[classStd]) {
        console.log(`Adding class from metrics: ${classStd}`);
        // If class not in classes array, add it from metrics
        grouped[classStd] = {
          classInfo: classMetrics[classStd].classInfo || {
            id: classMetrics[classStd].classId,
            name: classStd
          },
          classMetrics: classMetrics[classStd],
          divisions: [],
          totalStudents: 0,
          totalMale: 0,
          totalFemale: 0,
          totalTransport: 0,
          avgPerformance: 0,
          passRate: 0,
          enrolledStudents: []
        };
      }

      // Always update with actual enrollment data from classMetrics
      const metrics = classMetrics[classStd];
      if (metrics) {
        // Update with real data from metrics
        grouped[classStd].totalStudents = metrics.totalStudents || 0;
        grouped[classStd].enrolledStudents = metrics.enrolledStudents || [];
        grouped[classStd].classMetrics = metrics;

        console.log(`Updated ${classStd} with ${metrics.totalStudents} students`);

        // Calculate gender from enrolled students
        let maleCount = 0, femaleCount = 0, transportCount = 0;

        if (metrics.enrolledStudents) {
          metrics.enrolledStudents.forEach(student => {
            // Count gender (we'll need to get this from student data)
            // For now, using the division data if available
          });
        }

        // Use division data from classMetrics for accurate counts
        if (metrics.divisions) {
          Object.values(metrics.divisions).forEach(divData => {
            if (divData.students && divData.students.length > 0) {
              // This is real enrollment data
              divData.students.forEach(student => {
                // We'll need to fetch actual gender data
              });
            }
          });
        }
      }
    });

    // Add division data to respective classes
    Object.values(divisionMetrics).forEach(division => {
      if (division.divisionInfo) {
        // Try to match division to class by name patterns
        const divName = division.divisionInfo.name;

        // Try different matching patterns
        let matched = false;

        // Pattern 1: Division name contains class name (e.g., "9A" matches "Class 9")
        Object.keys(grouped).forEach(className => {
          if (!matched) {
            // Extract number from class name
            const classNumMatch = className.match(/(\d+)/);
            const divNumMatch = divName.match(/(\d+)/);

            if (classNumMatch && divNumMatch && classNumMatch[1] === divNumMatch[1]) {
              grouped[className].divisions.push(division);
              grouped[className].totalStudents += division.enrollment.total;
              grouped[className].totalMale += division.demographics.gender.counts.male;
              grouped[className].totalFemale += division.demographics.gender.counts.female;
              grouped[className].totalTransport += division.demographics.transport.count;
              matched = true;
            }
          }
        });

        // If no match found, try exact name match
        if (!matched && grouped[divName]) {
          grouped[divName].divisions.push(division);
          grouped[divName].totalStudents += division.enrollment.total;
          grouped[divName].totalMale += division.demographics.gender.counts.male;
          grouped[divName].totalFemale += division.demographics.gender.counts.female;
          grouped[divName].totalTransport += division.demographics.transport.count;
        }
      }
    });

    // Calculate final aggregated metrics
    Object.values(grouped).forEach(classData => {
      // Use data from classMetrics if available (it has the actual enrollment data)
      const metrics = classData.classMetrics;
      if (metrics && (metrics.totalStudents > 0 || metrics.enrolledStudents?.length > 0)) {
        // Preserve the student count from classMetrics (don't overwrite with 0 from divisions)
        const metricsTotal = metrics.totalStudents || 0;
        const divisionTotal = classData.totalStudents || 0;

        // Use the maximum of the two to ensure we don't lose data
        classData.totalStudents = Math.max(metricsTotal, divisionTotal);
        classData.enrolledStudents = metrics.enrolledStudents || [];

        // Extract gender counts from enrolled students
        if (metrics.enrolledStudents && metrics.enrolledStudents.length > 0) {
          // We have enrolled students, use this data
          classData.hasEnrolledStudents = true;
        }

        // Count divisions from the metrics data
        if (metrics.divisions) {
          const divisionCount = Object.keys(metrics.divisions).length;
          classData.avgStudentsPerDivision = divisionCount > 0
            ? Math.round(classData.totalStudents / divisionCount)
            : classData.totalStudents;
        } else {
          // No divisions, so avg per division is just total
          classData.avgStudentsPerDivision = classData.totalStudents;
        }

        console.log(`Final count for ${classData.classInfo.name}: ${classData.totalStudents} students`);
      } else if (classData.divisions.length > 0) {
        // Fall back to division data if no classMetrics
        classData.avgStudentsPerDivision = Math.round(classData.totalStudents / classData.divisions.length);
      } else {
        // No students in this class
        classData.avgStudentsPerDivision = 0;
      }

      // Calculate gender ratio
      classData.genderRatio = classData.totalMale > 0 && classData.totalFemale > 0
        ? `${classData.totalMale}:${classData.totalFemale}`
        : 'N/A';

      // Calculate transport percentage
      classData.transportPercentage = classData.totalStudents > 0
        ? Math.round((classData.totalTransport / classData.totalStudents) * 100)
        : 0;
    });

    return grouped;
  }, [classMetrics, divisionMetrics]);

  // Calculate overall statistics
  const overallStats = useMemo(() => {
    let totalClasses = Object.keys(classDivisionData).length;
    let totalDivisions = 0;
    let totalStudents = 0;
    let totalMale = 0;
    let totalFemale = 0;
    let totalTransport = 0;

    Object.values(classDivisionData).forEach(classData => {
      totalDivisions += classData.divisions.length;
      totalStudents += classData.totalStudents;
      totalMale += classData.totalMale;
      totalFemale += classData.totalFemale;
      totalTransport += classData.totalTransport;
    });

    return {
      totalClasses,
      totalDivisions,
      totalStudents,
      totalMale,
      totalFemale,
      genderRatio: totalMale > 0 && totalFemale > 0 ? `${totalMale}:${totalFemale}` : 'N/A',
      malePercentage: totalStudents > 0 ? Math.round((totalMale / totalStudents) * 100) : 0,
      femalePercentage: totalStudents > 0 ? Math.round((totalFemale / totalStudents) * 100) : 0,
      totalTransport,
      transportPercentage: totalStudents > 0 ? Math.round((totalTransport / totalStudents) * 100) : 0,
      avgStudentsPerClass: totalClasses > 0 ? Math.round(totalStudents / totalClasses) : 0,
      avgStudentsPerDivision: totalDivisions > 0 ? Math.round(totalStudents / totalDivisions) : 0
    };
  }, [classDivisionData]);

  const getPerformanceColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600 bg-green-100';
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getCapacityColor = (students) => {
    if (students >= 45) return 'text-red-600 bg-red-100';
    if (students >= 35) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const loading = classLoading || divisionLoading;
  const error = classError || divisionError;

  if (loading && Object.keys(classDivisionData).length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading class and division data...</p>
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
              <h1 className="text-3xl font-bold text-gray-800">Class & Division Management</h1>
              <p className="text-gray-600 mt-1">Comprehensive view of classes, divisions, and student metrics</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={fetchData}
                className="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition duration-200 inline-flex items-center gap-2 shadow-sm border border-gray-200"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition duration-200 inline-flex items-center gap-2 shadow-lg">
                <Plus className="w-4 h-4" />
                Add Class
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {['overview', 'classes', 'performance', 'analytics'].map(tab => (
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
                {tab === 'classes' && 'Classes & Divisions'}
                {tab === 'performance' && 'Exam Performance'}
                {tab === 'analytics' && 'Analytics'}
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
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <School className="h-6 w-6 text-blue-600" />
                  </div>
                  <span className="text-xs font-medium text-green-600">Active</span>
                </div>
                <p className="text-2xl font-bold text-gray-800">{overallStats.totalClasses}</p>
                <p className="text-sm text-gray-600">Total Classes</p>
                <p className="text-xs text-gray-500 mt-1">{overallStats.totalDivisions} divisions</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <span className="text-xs font-medium text-blue-600">
                    {overallStats.avgStudentsPerDivision}/div
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-800">{overallStats.totalStudents}</p>
                <p className="text-sm text-gray-600">Total Students</p>
                <div className="mt-2 flex gap-2 text-xs">
                  <span className="text-blue-600">♂ {overallStats.malePercentage}%</span>
                  <span className="text-pink-600">♀ {overallStats.femalePercentage}%</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-purple-600" />
                  </div>
                  <span className="text-xs font-medium text-purple-600">
                    {overallStats.genderRatio}
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-800">Gender Ratio</p>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2 flex overflow-hidden">
                  <div className="bg-blue-500 h-2" style={{ width: `${overallStats.malePercentage}%` }}></div>
                  <div className="bg-pink-500 h-2" style={{ width: `${overallStats.femalePercentage}%` }}></div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-yellow-100 p-3 rounded-lg">
                    <Bus className="h-6 w-6 text-yellow-600" />
                  </div>
                  <span className="text-xs font-medium text-yellow-600">
                    {overallStats.transportPercentage}%
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-800">{overallStats.totalTransport}</p>
                <p className="text-sm text-gray-600">Transport Users</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-red-100 p-3 rounded-lg">
                    <Trophy className="h-6 w-6 text-red-600" />
                  </div>
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-gray-800">78%</p>
                <p className="text-sm text-gray-600">Avg Performance</p>
                <p className="text-xs text-green-600 mt-1">+5% this term</p>
              </div>
            </div>

            {/* Class Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Object.entries(classDivisionData)
                .sort((a, b) => {
                  // Sort by class number (extract number from class name)
                  const numA = parseInt(a[0].match(/\d+/)?.[0]) || 999;
                  const numB = parseInt(b[0].match(/\d+/)?.[0]) || 999;
                  // If no number, sort alphabetically
                  if (numA === 999 && numB === 999) {
                    return a[0].localeCompare(b[0]);
                  }
                  return numA - numB;
                })
                .map(([classStd, classData]) => (
                <div key={classStd} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-base font-bold text-gray-800">{classStd}</h3>
                      <p className="text-xs text-gray-500">
                        {classData.divisions.length || 'No'} division{classData.divisions.length !== 1 ? 's' : ''}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCapacityColor(classData.avgStudentsPerDivision)}`}>
                      {classData.avgStudentsPerDivision} avg/div
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-xs">Students</span>
                      <span className="font-semibold text-sm text-gray-800">
                        {classData.totalStudents || 0}
                      </span>
                    </div>

                    {classData.totalStudents > 0 && (
                      <>
                        <div>
                          <div className="flex justify-between text-xs text-gray-600 mb-1">
                            <span>Gender</span>
                            <span>{classData.genderRatio}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5 flex overflow-hidden">
                            <div
                              className="bg-blue-500 h-1.5"
                              style={{ width: `${(classData.totalMale / (classData.totalStudents || 1)) * 100}%` }}
                            ></div>
                            <div
                              className="bg-pink-500 h-1.5"
                              style={{ width: `${(classData.totalFemale / (classData.totalStudents || 1)) * 100}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-600">Transport</span>
                          <span className="font-medium">{classData.transportPercentage}%</span>
                        </div>
                      </>
                    )}

                    <div className="pt-2 border-t flex gap-1">
                      <button
                        onClick={() => {
                          setActiveTab('classes');
                          setExpandedClass(classStd);
                        }}
                        className="flex-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium hover:bg-blue-200"
                      >
                        Details
                      </button>
                      <button
                        onClick={() => {
                          setSelectedFeeClass({ id: classData.classInfo.id, name: classStd });
                          setShowFeeModal(true);
                        }}
                        className="flex-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium hover:bg-green-200"
                      >
                        Fees
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Classes & Divisions Tab */}
        {activeTab === 'classes' && (
          <div className="space-y-6">
            {/* Search Bar */}
            <div className="bg-white rounded-xl shadow-lg p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search classes or divisions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Classes with Divisions */}
            {Object.entries(classDivisionData)
              .sort((a, b) => {
                // Sort by class number (extract number from class name)
                const numA = parseInt(a[0].match(/\d+/)?.[0]) || 999;
                const numB = parseInt(b[0].match(/\d+/)?.[0]) || 999;
                // If no number, sort alphabetically
                if (numA === 999 && numB === 999) {
                  return a[0].localeCompare(b[0]);
                }
                return numA - numB;
              })
              .map(([classStd, classData]) => (
              <div key={classStd} className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div
                  className="p-6 cursor-pointer hover:bg-gray-50"
                  onClick={() => setExpandedClass(expandedClass === classStd ? null : classStd)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-blue-100 p-3 rounded-lg">
                        <School className="h-8 w-8 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">{classStd}</h3>
                        <p className="text-sm text-gray-500">
                          {classData.divisions.length || 0} division{classData.divisions.length !== 1 ? 's' : ''} • {classData.totalStudents || 0} student{classData.totalStudents !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Gender Ratio</p>
                        <p className="font-bold text-gray-800">{classData.genderRatio}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Transport</p>
                        <p className="font-bold text-gray-800">{classData.transportPercentage}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Avg Size</p>
                        <p className="font-bold text-gray-800">{classData.avgStudentsPerDivision}</p>
                      </div>
                      <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${
                        expandedClass === classStd ? 'rotate-180' : ''
                      }`} />
                    </div>
                  </div>
                </div>

                {expandedClass === classStd && (
                  <div className="border-t bg-gray-50 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {classData.divisions.map(division => (
                        <div
                          key={division.divisionInfo.id}
                          className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-bold text-gray-800">{division.divisionInfo.name}</h4>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              getCapacityColor(division.enrollment.total)
                            }`}>
                              {division.enrollment.total} students
                            </span>
                          </div>

                          <div className="space-y-2">
                            <div>
                              <div className="flex justify-between text-xs text-gray-600 mb-1">
                                <span>Gender</span>
                                <span>{division.demographics.gender.ratio}</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1.5 flex overflow-hidden">
                                <div
                                  className="bg-blue-500 h-1.5"
                                  style={{ width: `${division.demographics.gender.percentages.male}%` }}
                                ></div>
                                <div
                                  className="bg-pink-500 h-1.5"
                                  style={{ width: `${division.demographics.gender.percentages.female}%` }}
                                ></div>
                              </div>
                            </div>

                            <div className="flex justify-between text-xs">
                              <span className="text-gray-600">Transport</span>
                              <span className="font-medium">{division.demographics.transport.percentage}%</span>
                            </div>

                            <div className="flex justify-between text-xs">
                              <span className="text-gray-600">Houses</span>
                              <span className="font-medium">{Object.keys(division.academic.houses || {}).length}</span>
                            </div>

                            {division.recentActivity.newAdmissions.length > 0 && (
                              <div className="pt-2 border-t">
                                <p className="text-xs text-gray-500">
                                  {division.recentActivity.newAdmissions.length} new admission(s) this month
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="mt-3 pt-3 border-t flex gap-2">
                            <button className="flex-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium hover:bg-blue-200">
                              Details
                            </button>
                            <button className="flex-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium hover:bg-green-200">
                              Students
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Performance Tab */}
        {activeTab === 'performance' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Exam Performance Overview</h3>
              <div className="text-center py-12 text-gray-500">
                <BookOpenCheck className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg">Exam results integration coming soon</p>
                <p className="text-sm mt-2">Performance metrics will be displayed here once exam data is available</p>
              </div>
            </div>

            {/* Placeholder for exam performance data */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h4 className="font-bold text-gray-800 mb-4">Class-wise Performance</h4>
                <div className="space-y-3">
                  {Object.entries(classDivisionData).slice(0, 5).map(([classStd]) => (
                    <div key={classStd} className="flex items-center justify-between">
                      <span className="text-gray-700">Class {classStd}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${75 + Math.random() * 20}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-600 w-12 text-right">
                          {Math.round(75 + Math.random() * 20)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h4 className="font-bold text-gray-800 mb-4">Subject-wise Analysis</h4>
                <div className="space-y-3">
                  {['Mathematics', 'Science', 'English', 'Social Studies', 'Hindi'].map(subject => (
                    <div key={subject} className="flex items-center justify-between">
                      <span className="text-gray-700">{subject}</span>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          Math.random() > 0.5 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {Math.round(70 + Math.random() * 25)}% avg
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Gender Distribution by Class */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Gender Distribution by Class</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {Object.entries(classDivisionData)
                    .sort((a, b) => {
                      const numA = parseInt(a[0].match(/\d+/)?.[0]) || 999;
                      const numB = parseInt(b[0].match(/\d+/)?.[0]) || 999;
                      if (numA === 999 && numB === 999) return a[0].localeCompare(b[0]);
                      return numA - numB;
                    })
                    .filter(([_, classData]) => classData.totalStudents > 0)
                    .map(([classStd, classData]) => (
                    <div key={classStd}>
                      <div className="flex justify-between text-sm text-gray-700 mb-1">
                        <span>Class {classStd}</span>
                        <span className="text-xs">
                          ♂ {classData.totalMale} | ♀ {classData.totalFemale}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 flex overflow-hidden">
                        <div
                          className="bg-blue-500 h-3"
                          style={{ width: `${(classData.totalMale / (classData.totalStudents || 1)) * 100}%` }}
                        ></div>
                        <div
                          className="bg-pink-500 h-3"
                          style={{ width: `${(classData.totalFemale / (classData.totalStudents || 1)) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Division Size Analysis */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Division Size Analysis</h3>
                <div className="space-y-4">
                  {Object.entries(classDivisionData).map(([classStd, classData]) => (
                    <div key={classStd}>
                      <p className="text-sm font-medium text-gray-700 mb-2">Class {classStd}</p>
                      <div className="grid grid-cols-3 gap-2">
                        {classData.divisions.map(div => (
                          <div
                            key={div.divisionInfo.id}
                            className={`text-center p-2 rounded ${
                              div.enrollment.total >= 45 ? 'bg-red-100' :
                              div.enrollment.total >= 35 ? 'bg-yellow-100' : 'bg-green-100'
                            }`}
                          >
                            <p className="text-xs font-medium text-gray-700">{div.divisionInfo.name}</p>
                            <p className={`text-lg font-bold ${
                              div.enrollment.total >= 45 ? 'text-red-600' :
                              div.enrollment.total >= 35 ? 'text-yellow-600' : 'text-green-600'
                            }`}>
                              {div.enrollment.total}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Transport Usage */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Transport Usage Analysis</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(classDivisionData).map(([classStd, classData]) => (
                  <div key={classStd} className="text-center">
                    <div className="relative inline-block">
                      <svg className="w-20 h-20">
                        <circle
                          cx="40"
                          cy="40"
                          r="36"
                          stroke="#e5e7eb"
                          strokeWidth="8"
                          fill="none"
                        />
                        <circle
                          cx="40"
                          cy="40"
                          r="36"
                          stroke="#8b5cf6"
                          strokeWidth="8"
                          fill="none"
                          strokeDasharray={`${(classData.transportPercentage / 100) * 226} 226`}
                          strokeDashoffset="56.5"
                          transform="rotate(-90 40 40)"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-bold text-gray-800">
                          {classData.transportPercentage}%
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">Class {classStd}</p>
                    <p className="text-xs text-gray-500">{classData.totalTransport} students</p>
                  </div>
                ))}
              </div>
            </div>
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

export default ClassDivisionDashboard;