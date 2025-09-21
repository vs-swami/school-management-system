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
  MoreVertical,
  CheckCircle
} from 'lucide-react';
import { useClassStore } from '../../../application/stores/useClassStore';
import useDivisionStore from '../../../application/stores/useDivisionStore';
import { useFeeService, useDivisionService } from '../../../application/contexts/ServiceContext';
import UnifiedFeeManager from '../../components/fees/UnifiedFeeManager';
import FinanceSummary from '../../components/fees/FinanceSummary';
import DivisionManagementModal from '../../components/classes/DivisionManagementModal';

const ClassDivisionDashboard = () => {
  // Services
  const feeService = useFeeService();
  const divisionService = useDivisionService();

  // State Management - Enhanced with division count and gender statistics display
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedDivision, setSelectedDivision] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedClass, setExpandedClass] = useState(null);
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [selectedFeeClass, setSelectedFeeClass] = useState(null);
  const [feeAssignments, setFeeAssignments] = useState({});
  const [feeDefinitions, setFeeDefinitions] = useState([]);
  const [feeLoading, setFeeLoading] = useState(false);
  const [showDivisionModal, setShowDivisionModal] = useState(false);
  const [selectedClassForDivision, setSelectedClassForDivision] = useState(null);

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

  // Fee data will be fetched from backend

  // Load initial data
  useEffect(() => {
    fetchData();
  }, []);

  // Fetch fee data when classes are loaded
  useEffect(() => {
    console.log('Classes changed in useEffect:', classes.length);
    if (classes.length > 0) {
      console.log('Calling fetchFeeData because classes are loaded');
      fetchFeeData();
    } else {
      console.log('No classes available yet, skipping fetchFeeData');
    }
  }, [classes]);

  const fetchData = async () => {
    console.log('=== fetchData called ===');
    const startTime = Date.now();

    await Promise.all([
      fetchClassData(),
      fetchDivisionsWithMetrics(),
      fetchYearGroups()
      // Removed fetchFeeData from here - it will be called after classes are loaded
    ]);

    const loadTime = Date.now() - startTime;

  };

  const fetchFeeData = async () => {
    console.log('=== START fetchFeeData ===');
    console.log('Classes available:', classes.length, classes.map(c => ({ id: c.id, name: c.className })));
    const feeStartTime = Date.now();

    setFeeLoading(true);
    try {
      // OPTIMIZATION: Fetch definitions and assignments in parallel
      const [definitionsResult, assignments] = await Promise.all([
        feeService.getAllFeeDefinitions(),
        fetchAllFeeAssignments(classes)
      ]);

      if (definitionsResult.success) {
        console.log('Fee definitions fetched:', definitionsResult.data);
        setFeeDefinitions(definitionsResult.data);
      } else {
        console.error('Failed to fetch fee definitions:', definitionsResult.error);
        setFeeDefinitions([]);
      }

      setFeeAssignments(assignments);

      const feeLoadTime = Date.now() - feeStartTime;
      console.log(`=== END fetchFeeData in ${feeLoadTime}ms ===`);
    } catch (error) {
      console.error('Error fetching fee data:', error);
    } finally {
      setFeeLoading(false);
    }
  };

  // Helper function to fetch all fee assignments efficiently
  const fetchAllFeeAssignments = async (classes) => {
    const assignments = {};
    console.log('Fetching all fee assignments in one request...');

    try {
      // OPTIMIZATION: Fetch ALL assignments in a single API call
      const result = await feeService.getAllFeeAssignments();
      const allAssignments = result.success ? result.data : [];

      // Group assignments by class
      if (Array.isArray(allAssignments)) {
        // Initialize empty arrays for all classes
        classes.forEach(cls => {
          const className = cls.className;
          assignments[className] = [];
        });

        // Group assignments by class
        allAssignments.forEach(assignment => {
          const classId = assignment.class?.id;
          const classObj = classes.find(c => c.id === classId);
          const className = classObj?.className;
          if (className) {
            if (!assignments[className]) assignments[className] = [];
            assignments[className].push(assignment);
          }
        });

        // Log summary
        const summary = Object.entries(assignments)
          .map(([name, items]) => `${name}: ${items.length}`)
          .join(', ');
        console.log('Fee assignments loaded:', summary);
      } else {
        console.log('No fee assignments found');
        classes.forEach(cls => {
          const className = cls.className;
          assignments[className] = [];
        });
      }
    } catch (error) {
      console.error('Error fetching all fee assignments:', error);
      // Initialize empty arrays on error
      classes.forEach(cls => {
        const className = cls.className;
        assignments[className] = [];
      });
    }

    return assignments;
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
      const className = cls.className || `Class ${cls.id}`;
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

    // Update with actual enrollment data from classMetrics (only for existing classes)
    Object.keys(grouped).forEach(classStd => {
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

  // Calculate financial forecast based on enrolled students and backend fee data
  // TODO: This is deprecated and kept for backward compatibility with the old summary view
  // Will be removed once all classes use the new FinanceSummary component
  const financialForecast = useMemo(() => {
    const forecast = {
      byClass: {},
      totalRevenue: 0,
      totalTuitionFees: 0,
      totalTransportFees: 0,
      totalActivityFees: 0,
      avgRevenuePerStudent: 0,
      projectedCollection: 0, // Assuming 85% collection rate
      projectedPending: 0,
      installmentExcess: 0, // Potential excess from installment payments
      byFeeType: {}
    };

    Object.entries(classDivisionData).forEach(([className, classData]) => {
      const enrolledCount = classData.totalStudents || 0;
      const transportCount = classData.totalTransport || 0;

      // Get fee assignments for this class from backend data
      const classAssignments = feeAssignments[className] || [];

      console.log(`\n=== Fee Calculation for ${className} ===`);
      console.log('Enrolled Students:', enrolledCount);
      console.log('Fee Assignments from Backend:', classAssignments);
      console.log('Fee Assignments available in state:', Object.keys(feeAssignments));
      console.log('Raw feeAssignments state:', feeAssignments);

      // Calculate fees ONLY from backend data
      let tuitionFee = 0;
      let transportFee = 0;
      let activityFee = 0;
      let annualFee = 0;
      let classInstallmentExcess = 0;
      const classFeeTypes = {};

      // Process backend fee assignments
      classAssignments.forEach(assignment => {
        if (assignment.fee && assignment.fee.base_amount) {
          const feeAmount = parseFloat(assignment.fee.base_amount);
          const feeTypeName = assignment.fee.type?.name || 'Other';
          const feeTypeNameLower = feeTypeName.toLowerCase();
          const feeFrequency = assignment.fee.frequency || 'yearly';
          const installments = assignment.fee.installments || [];

          console.log(`  Processing fee: ${assignment.fee.name}`, {
            type: feeTypeNameLower,
            amount: feeAmount,
            frequency: feeFrequency,
            installments: installments.length
          });

          // Calculate installment excess if installments exist
          if (installments.length > 0) {
            const installmentTotal = installments.reduce((sum, inst) => {
              return sum + parseFloat(inst.amount || 0);
            }, 0);

            // Calculate excess (difference between installment total and base amount)
            const difference = installmentTotal - feeAmount;
            if (difference > 0) {
              const excess = difference;
              classInstallmentExcess += excess * enrolledCount;
              console.log(`    Installment excess: ₹${excess} per student, Total: ₹${excess * enrolledCount}`);
            } else if (difference === 0) {
              console.log(`    Installments match base amount: ₹${installmentTotal} = ₹${feeAmount}`);
            } else {
              console.log(`    Installments less than base: ₹${installmentTotal} < ₹${feeAmount} (shortfall: ₹${Math.abs(difference)})`);
            }
          }

          // Track by fee type for reporting
          if (!classFeeTypes[feeTypeName]) {
            classFeeTypes[feeTypeName] = {
              baseAmount: 0,
              installmentTotal: 0,
              studentCount: 0,
              excess: 0
            };
          }

          classFeeTypes[feeTypeName].baseAmount += feeAmount;
          classFeeTypes[feeTypeName].studentCount = enrolledCount;

          if (installments.length > 0) {
            const instTotal = installments.reduce((sum, inst) => sum + parseFloat(inst.amount || 0), 0);
            classFeeTypes[feeTypeName].installmentTotal += instTotal;
            classFeeTypes[feeTypeName].excess += Math.max(0, instTotal - feeAmount);
            classFeeTypes[feeTypeName].hasInstallments = true;
            classFeeTypes[feeTypeName].installmentCount = installments.length;
          }

          // Categorize by fee type
          if (feeTypeNameLower.includes('tuition') || feeTypeNameLower.includes('academic') || feeTypeNameLower.includes('school')) {
            tuitionFee += feeAmount;
          } else if (feeTypeNameLower.includes('transport') || feeTypeNameLower.includes('bus')) {
            transportFee = feeAmount; // Transport is per student using transport
          } else if (feeTypeNameLower.includes('activity') || feeTypeNameLower.includes('extra') || feeTypeNameLower.includes('co-curricular')) {
            activityFee += feeAmount;
          } else {
            // Add any unclassified fee to tuition
            tuitionFee += feeAmount;
          }

          // Calculate annual equivalent
          switch (feeFrequency) {
            case 'monthly':
              annualFee += feeAmount * 12;
              break;
            case 'term':
            case 'quarterly':
              annualFee += feeAmount * 3;
              break;
            case 'one_time':
            case 'yearly':
            case 'annual':
            default:
              annualFee += feeAmount;
              break;
          }
        }
      });

      // If no fees found in backend, the forecast will be 0 (which is correct - no fees defined)

      console.log('Calculated Fees:', {
        tuitionFee,
        transportFee,
        activityFee,
        annualFee,
        dataSource: classAssignments.length > 0 ? 'Backend' : 'No fees defined'
      });

      // Calculate class-wise forecast
      const classForecast = {
        enrolledStudents: enrolledCount,
        tuitionRevenue: enrolledCount * tuitionFee,
        transportRevenue: transportCount * transportFee,
        activityRevenue: enrolledCount * activityFee,
        totalRevenue: (enrolledCount * tuitionFee) +
                     (transportCount * transportFee) +
                     (enrolledCount * activityFee),
        perStudentFee: annualFee,
        transportUsers: transportCount,
        installmentExcess: classInstallmentExcess,
        feeTypes: classFeeTypes
      };

      forecast.byClass[className] = classForecast;
      forecast.totalRevenue += classForecast.totalRevenue;
      forecast.totalTuitionFees += classForecast.tuitionRevenue;
      forecast.totalTransportFees += classForecast.transportRevenue;
      forecast.totalActivityFees += classForecast.activityRevenue;
      forecast.installmentExcess += classInstallmentExcess;

      // Aggregate fee types across all classes
      Object.entries(classFeeTypes).forEach(([typeName, typeData]) => {
        if (!forecast.byFeeType[typeName]) {
          forecast.byFeeType[typeName] = {
            baseAmount: 0,
            installmentTotal: 0,
            totalStudents: 0,
            totalExcess: 0
          };
        }
        forecast.byFeeType[typeName].baseAmount += typeData.baseAmount * typeData.studentCount;
        forecast.byFeeType[typeName].installmentTotal += typeData.installmentTotal * typeData.studentCount;
        forecast.byFeeType[typeName].totalStudents += typeData.studentCount;
        forecast.byFeeType[typeName].totalExcess += typeData.excess * typeData.studentCount;
      });
    });

    // Calculate projected collection (85% collection rate is typical)
    forecast.projectedCollection = Math.round(forecast.totalRevenue * 0.85);
    forecast.projectedPending = Math.round(forecast.totalRevenue * 0.15);

    // Average revenue per student
    const totalStudents = Object.values(classDivisionData).reduce((sum, c) => sum + c.totalStudents, 0);
    forecast.avgRevenuePerStudent = totalStudents > 0 ? Math.round(forecast.totalRevenue / totalStudents) : 0;

    return forecast;
  }, [classDivisionData, feeAssignments]);

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

  const loading = classLoading || divisionLoading || feeLoading;
  const error = classError || divisionError;

  // Loading overlay component
  const LoadingOverlay = () => (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 shadow-xl">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-700 font-medium">Loading class data...</p>
        {feeLoading && <p className="text-sm text-gray-500 mt-2">Fetching fee information...</p>}
      </div>
    </div>
  );

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
      {/* Loading Overlay */}
      {loading && <LoadingOverlay />}

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
            {/* Class Selector for Finance Summary */}
            <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <label className="text-sm font-medium text-gray-700">
                    Select a class to view financial details:
                  </label>
                  <select
                    value={selectedClass?.id || ''}
                    onChange={(e) => {
                      const classId = e.target.value;
                      const selected = classes.find(c => c.id === parseInt(classId));
                      setSelectedClass(selected || null);
                    }}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">— Choose a class —</option>
                    {classes.map(cls => (
                      <option key={cls.id} value={cls.id}>
                        {cls.className}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Finance Information Summary */}
            {selectedClass ? (
              <FinanceSummary
                entityType="class"
                entityId={selectedClass.id}
                entityName={selectedClass.className}
                studentCount={classDivisionData[selectedClass.className]?.totalStudents || 0}
                onConfigureFees={() => {
                  setSelectedFeeClass(selectedClass);
                  setShowFeeModal(true);
                }}
              />
            ) : (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <DollarSign className="h-6 w-6 text-green-600" />
                  Finance Information Summary
                </h2>
                <button className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1">
                  View Details
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Check if any fees are defined */}
              {financialForecast.totalRevenue === 0 && Object.keys(feeAssignments).every(key => !feeAssignments[key] || feeAssignments[key].length === 0) ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium mb-2">No Fee Structure Defined</p>
                  <p className="text-sm text-gray-500 mb-4">
                    Please configure fee definitions and assignments in the backend to see financial forecasts.
                  </p>
                  <button
                    onClick={() => setShowFeeModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
                  >
                    Configure Fees
                  </button>
                </div>
              ) : (
              <>
              <div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  {/* Total Tuition Fees */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Total Tuition Fees</span>
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-800">₹{financialForecast.totalTuitionFees.toLocaleString('en-IN')}</p>
                    <p className="text-xs text-gray-500 mt-1">Based on {overallStats.totalStudents} enrolled students</p>
                    <div className="mt-2 text-xs text-gray-600">
                      <div>Avg per student: ₹{(financialForecast.totalTuitionFees / (overallStats.totalStudents || 1)).toFixed(0).toLocaleString('en-IN')}</div>
                    </div>
                  </div>

                  {/* Installment Information */}
                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Installment Status</span>
                      <DollarSign className="h-4 w-4 text-orange-600" />
                    </div>
                    {financialForecast.installmentExcess > 0 ? (
                      <>
                        <p className="text-2xl font-bold text-gray-800">₹{financialForecast.installmentExcess.toLocaleString('en-IN')}</p>
                        <p className="text-xs text-gray-500 mt-1">Additional from installment plans</p>
                        <div className="mt-2 text-xs text-gray-600">
                          <div>{((financialForecast.installmentExcess / (financialForecast.totalRevenue || 1)) * 100).toFixed(1)}% above base fees</div>
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="text-2xl font-bold text-gray-800">Balanced</p>
                        <p className="text-xs text-gray-500 mt-1">Installments match base fees</p>
                        <div className="mt-2 text-xs text-gray-600">
                          <div>No additional charges</div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Class-wise Distribution */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Classes with Fee Structure</span>
                      <School className="h-4 w-4 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-800">{Object.keys(financialForecast.byClass).length}</p>
                    <p className="text-xs text-gray-500 mt-1">Active classes</p>
                    <div className="mt-2 text-xs text-gray-600">
                      <div>Total divisions: {overallStats.totalDivisions}</div>
                    </div>
                  </div>
                </div>

                {/* Fee Type Breakdown */}
                {Object.keys(financialForecast.byFeeType).length > 0 && (
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Fee Type Analysis with Installments</h3>
                    <div className="space-y-2">
                      {Object.entries(financialForecast.byFeeType).map(([typeName, typeData]) => {
                        const hasExcess = typeData.totalExcess > 0;
                        const hasInstallments = typeData.hasInstallments;
                        const excessPercentage = typeData.baseAmount > 0 ? ((typeData.totalExcess / typeData.baseAmount) * 100).toFixed(1) : 0;
                        const installmentMatch = hasInstallments && typeData.totalExcess === 0;

                        return (
                          <div key={typeName} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                            <div className="flex-1">
                              <span className="text-sm font-medium text-gray-700">{typeName}</span>
                              <span className="text-xs text-gray-500 ml-2">
                                ({typeData.totalStudents} students)
                              </span>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <div className="text-sm font-semibold text-gray-800">
                                  ₹{typeData.baseAmount.toLocaleString('en-IN')}
                                </div>
                                <div className="text-xs text-gray-500">Base Amount</div>
                              </div>
                              {hasExcess && (
                                <div className="text-right">
                                  <div className="text-sm font-semibold text-orange-600">
                                    +₹{typeData.totalExcess.toLocaleString('en-IN')}
                                  </div>
                                  <div className="text-xs text-gray-500">+{excessPercentage}% excess</div>
                                </div>
                              )}
                              {installmentMatch && (
                                <div className="text-right">
                                  <div className="text-sm font-semibold text-green-600">
                                    ✓ Balanced
                                  </div>
                                  <div className="text-xs text-gray-500">{typeData.installmentCount} installments</div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {financialForecast.installmentExcess > 0 && (
                      <div className="mt-3 pt-3 border-t text-xs text-gray-600">
                        <strong>Note:</strong> Installment excess occurs when the sum of installment payments exceeds the base fee amount.
                        This represents potential additional revenue from students choosing installment plans.
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Class-wise Finance Forecast */}
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Class-wise Revenue Forecast</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {Object.entries(financialForecast.byClass)
                    .sort((a, b) => {
                      // Sort by class number
                      const numA = parseInt(a[0].match(/\d+/)?.[0]) || 999;
                      const numB = parseInt(b[0].match(/\d+/)?.[0]) || 999;
                      if (numA === 999 && numB === 999) {
                        return a[0].localeCompare(b[0]);
                      }
                      return numA - numB;
                    })
                    .map(([classStd, classFinance]) => {
                      const revenuePercentage = financialForecast.totalRevenue > 0
                        ? Math.round((classFinance.totalRevenue / financialForecast.totalRevenue) * 100)
                        : 0;

                      return (
                        <div key={classStd} className="flex items-center justify-between hover:bg-gray-50 p-2 rounded">
                          <div className="flex items-center gap-3 flex-1">
                            <span className="text-sm font-medium text-gray-700 min-w-[80px]">{classStd}</span>
                            <span className="text-xs text-gray-500">
                              {classFinance.enrolledStudents} students
                              {classFinance.transportUsers > 0 && ` • ${classFinance.transportUsers} transport`}
                            </span>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="text-sm font-semibold text-gray-800">
                                ₹{classFinance.totalRevenue.toLocaleString('en-IN')}
                              </div>
                              <div className="text-xs text-gray-500">
                                ₹{(classFinance.perStudentFee || 0).toLocaleString('en-IN')}/student
                              </div>
                            </div>
                            <div className="w-24">
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${
                                    revenuePercentage >= 15 ? 'bg-green-500' :
                                    revenuePercentage >= 8 ? 'bg-yellow-500' : 'bg-blue-500'
                                  }`}
                                  style={{ width: `${Math.min(revenuePercentage * 5, 100)}%` }}
                                ></div>
                              </div>
                              <span className="text-xs text-gray-600 mt-1 block text-center">
                                {revenuePercentage}%
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>

                {/* Summary Totals */}
                <div className="mt-4 pt-4 border-t bg-gray-50 p-3 rounded">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-700">Total Forecast</span>
                    <span className="text-lg font-bold text-gray-900">
                      ₹{financialForecast.totalRevenue.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 mt-2 grid grid-cols-3 gap-2">
                    <div>
                      <span className="font-medium">Tuition:</span> ₹{financialForecast.totalTuitionFees.toLocaleString('en-IN')}
                    </div>
                    <div>
                      <span className="font-medium">Transport:</span> ₹{financialForecast.totalTransportFees.toLocaleString('en-IN')}
                    </div>
                    <div>
                      <span className="font-medium">Activities:</span> ₹{financialForecast.totalActivityFees.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              </div>
              </>
              )}
            </div>
            )}

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

            {/* Data Status Alert */}
            {overallStats.totalStudents <= 1 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-yellow-800">Limited Student Data</h3>
                    <p className="text-sm text-yellow-700 mt-1">
                      Currently only {overallStats.totalStudents} student{overallStats.totalStudents !== 1 ? 's' : ''} enrolled.
                      Add more students through the enrollment process to see full analytics and metrics.
                    </p>
                  </div>
                </div>
              </div>
            )}

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
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <School className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-gray-800">{classStd}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
                            {classData.divisions.length || 0} Division{classData.divisions.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                    {classData.totalStudents > 0 && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCapacityColor(classData.avgStudentsPerDivision)}`}>
                        {classData.avgStudentsPerDivision} avg
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    {classData.totalStudents > 0 ? (
                      <>
                        {/* Total Students with prominent display */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-blue-600" />
                              <span className="text-xs text-gray-600 font-medium">Total Students</span>
                            </div>
                            <span className="font-bold text-lg text-gray-800">
                              {classData.totalStudents}
                            </span>
                          </div>

                          {/* Gender Breakdown */}
                          <div className="flex items-center gap-3 mt-2">
                            <div className="flex items-center gap-1">
                              <span className="text-xs font-bold text-blue-600">♂</span>
                              <span className="text-sm font-semibold text-gray-700">{classData.totalMale || 0}</span>
                            </div>
                            <div className="text-gray-300">|</div>
                            <div className="flex items-center gap-1">
                              <span className="text-xs font-bold text-pink-600">♀</span>
                              <span className="text-sm font-semibold text-gray-700">{classData.totalFemale || 0}</span>
                            </div>
                          </div>

                          <div className="w-full bg-gray-200 rounded-full h-2 flex overflow-hidden mt-2">
                            <div
                              className="bg-blue-500 h-2"
                              style={{ width: `${(classData.totalMale / classData.totalStudents) * 100}%` }}
                            ></div>
                            <div
                              className="bg-pink-500 h-2"
                              style={{ width: `${(classData.totalFemale / classData.totalStudents) * 100}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-xs px-1">
                          <div className="flex items-center gap-1">
                            <Bus className="w-3.5 h-3.5 text-purple-600" />
                            <span className="text-gray-600">Transport</span>
                          </div>
                          <span className="font-semibold text-gray-800">{classData.transportPercentage}% ({classData.totalTransport || 0})</span>
                        </div>
                      </>
                    ) : (
                      /* Empty state for class with no students */
                      <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm font-medium text-gray-600">No Students Enrolled</p>
                        <p className="text-xs text-gray-500 mt-1">Add students to see metrics</p>
                      </div>
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
                        <div className="flex items-center gap-4 mt-2">
                          {/* Divisions Count */}
                          <div className="flex items-center gap-1.5 bg-indigo-50 px-3 py-1 rounded-full">
                            <BookOpen className="w-4 h-4 text-indigo-600" />
                            <span className="text-sm font-semibold text-indigo-700">
                              {classData.divisions.length || 0} Division{classData.divisions.length !== 1 ? 's' : ''}
                            </span>
                          </div>

                          {/* Total Students */}
                          <div className="flex items-center gap-1.5 bg-green-50 px-3 py-1 rounded-full">
                            <Users className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-semibold text-green-700">
                              {classData.totalStudents || 0} Students
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      {/* Gender Distribution */}
                      <div className="text-center">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Gender Distribution</p>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-xs font-bold text-blue-600">♂</span>
                            </div>
                            <span className="font-bold text-gray-800">{classData.totalMale || 0}</span>
                          </div>
                          <div className="text-gray-400">/</div>
                          <div className="flex items-center gap-1">
                            <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                              <span className="text-xs font-bold text-pink-600">♀</span>
                            </div>
                            <span className="font-bold text-gray-800">{classData.totalFemale || 0}</span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 flex overflow-hidden mt-2">
                          <div
                            className="bg-blue-500 h-2"
                            style={{ width: `${classData.totalStudents ? (classData.totalMale / classData.totalStudents * 100) : 0}%` }}
                          ></div>
                          <div
                            className="bg-pink-500 h-2"
                            style={{ width: `${classData.totalStudents ? (classData.totalFemale / classData.totalStudents * 100) : 0}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Transport Usage */}
                      <div className="text-center">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Transport</p>
                        <div className="flex items-center justify-center gap-1">
                          <Bus className="w-5 h-5 text-purple-600" />
                          <p className="font-bold text-gray-800">{classData.transportPercentage}%</p>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{classData.totalTransport || 0} students</p>
                      </div>

                      {/* Average per Division */}
                      <div className="text-center">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Avg/Division</p>
                        <p className="text-2xl font-bold text-gray-800">{classData.avgStudentsPerDivision}</p>
                        <p className="text-xs text-gray-600 mt-1">students</p>
                      </div>

                      <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${
                        expandedClass === classStd ? 'rotate-180' : ''
                      }`} />
                    </div>
                  </div>
                </div>

                {expandedClass === classStd && (
                  <div className="border-t bg-gray-50 p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-lg font-semibold text-gray-700">Divisions</h4>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedClassForDivision(classData.classInfo);
                          setShowDivisionModal(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Manage Divisions
                      </button>
                    </div>
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

      {/* Division Management Modal */}
      {showDivisionModal && selectedClassForDivision && (
        <DivisionManagementModal
          isOpen={showDivisionModal}
          onClose={() => {
            setShowDivisionModal(false);
            setSelectedClassForDivision(null);
            fetchData(); // Refresh data after changes
          }}
          selectedClass={selectedClassForDivision}
          divisionService={divisionService}
        />
      )}

      {/* Fee Management Modal */}
      {showFeeModal && selectedFeeClass && (
        <UnifiedFeeManager
          entityType="class"
          entityId={selectedFeeClass.id}
          entityName={selectedFeeClass.name}
          onClose={() => {
            setShowFeeModal(false);
            setSelectedFeeClass(null);
          }}
        />
      )}
    </div>
  );
};

export default ClassDivisionDashboard;