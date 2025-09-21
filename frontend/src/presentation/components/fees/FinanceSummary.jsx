import React, { useEffect, useState } from 'react';
import { useFeeService } from '../../../application/hooks/useServices';
import {
  DollarSign,
  TrendingUp,
  School,
  MapPin,
  AlertCircle,
  ChevronRight,
  Bus,
  Users
} from 'lucide-react';

/**
 * Reusable Finance Summary Component
 * Shows financial overview for any entity (class, bus stop, etc.)
 */
const FinanceSummary = ({
  entityType,
  entityId,
  entityName,
  studentCount: providedStudentCount = 0,
  onConfigureFees
}) => {
  const [assignments, setAssignments] = useState([]);
  const [actualStudentCount, setActualStudentCount] = useState(0);
  const [financialData, setFinancialData] = useState({
    totalRevenue: 0,
    totalMonthlyFees: 0,
    totalYearlyFees: 0,
    totalOneTimeFees: 0,
    byFeeType: {},
    feeCount: 0,
    predominantFrequency: 'yearly',
    frequencyCounts: {}
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (entityId) {
      loadFinancialData();
    }
  }, [entityId, entityType]);

  const feeService = useFeeService();

  const loadFinancialData = async () => {
    console.log('Loading financial data for:', entityType, entityId, 'Provided count:', providedStudentCount);
    setLoading(true);
    try {
      let result = { data: [] };
      let studentCount = 0;

      // Fetch based on entity type
      if (entityType === 'class') {
        result = await feeService.getFeeAssignmentsByClass(entityId);

        // Use provided student count for classes (passed from parent component)
        // Since ClassDivisionDashboard already has the student count
        studentCount = providedStudentCount || 0;
        console.log('Class student count:', studentCount);
        console.log('Fee assignments result for class:', result);

      } else if (entityType === 'busStop') {
        result = await feeService.getFeeAssignmentsByBusStop(entityId);

        try {
          // For bus stops, we need to fetch students through seat allocations
          // Since seat allocations are linked to enrollment administrations,
          // and there's no direct API endpoint for this, we'll use the provided count
          // or default to 0 for now
          studentCount = providedStudentCount || 0;
          console.log('Bus stop student count:', studentCount);
        } catch (error) {
          console.error('Error fetching students for bus stop:', error);
          studentCount = 0;
        }
      }

      const data = result.data || [];
      console.log('FinanceSummary - Assignments data:', data);
      console.log('FinanceSummary - Number of assignments:', data.length);

      setActualStudentCount(studentCount);
      setAssignments(data);
      calculateFinancials(data, studentCount);
    } catch (error) {
      console.error('Error loading financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateFinancials = (assignments, studentCount) => {
    let totalRevenue = 0;
    let totalMonthlyFees = 0;
    let totalYearlyFees = 0;
    let totalOneTimeFees = 0;
    const byFeeType = {};

    // Track frequency counts to determine predominant frequency
    const frequencyCounts = {
      monthly: 0,
      quarterly: 0,
      term: 0,
      yearly: 0,
      one_time: 0
    };

    assignments.forEach(assignment => {
      if (!assignment.fee) return;

      const fee = assignment.fee;
      const amount = fee.base_amount || 0;
      const frequency = fee.frequency || 'one_time';
      const typeName = fee.type?.name || 'Other';

      // Count frequencies
      frequencyCounts[frequency] = (frequencyCounts[frequency] || 0) + 1;

      // Calculate annualized amount based on frequency
      let annualizedAmount = amount;
      if (frequency === 'monthly') {
        annualizedAmount = amount * 12;
        totalMonthlyFees += amount;
      } else if (frequency === 'quarterly') {
        annualizedAmount = amount * 4;
      } else if (frequency === 'term') {
        annualizedAmount = amount * 3;
      } else if (frequency === 'yearly') {
        totalYearlyFees += amount;
      } else {
        totalOneTimeFees += amount;
      }

      totalRevenue += annualizedAmount;

      // Group by fee type
      if (!byFeeType[typeName]) {
        byFeeType[typeName] = {
          totalAmount: 0,
          count: 0,
          fees: []
        };
      }
      byFeeType[typeName].totalAmount += annualizedAmount;
      byFeeType[typeName].count++;
      byFeeType[typeName].fees.push(fee.name);
    });

    // Store per-student rates before multiplication
    const perStudentRevenue = totalRevenue;
    const perStudentMonthly = totalMonthlyFees;
    const perStudentYearly = totalYearlyFees;
    const perStudentOneTime = totalOneTimeFees;

    // Store per-student rates for each fee type
    const perStudentByFeeType = {};
    Object.keys(byFeeType).forEach(key => {
      perStudentByFeeType[key] = byFeeType[key].totalAmount;
    });

    // Apply student multiplier for actual enrolled/allocated students
    // If no students, revenue should be 0
    if (studentCount > 0) {
      totalRevenue *= studentCount;
      totalMonthlyFees *= studentCount;
      totalYearlyFees *= studentCount;
      totalOneTimeFees *= studentCount;

      Object.keys(byFeeType).forEach(key => {
        byFeeType[key].totalAmount *= studentCount;
      });
    } else {
      // No students = no revenue
      totalRevenue = 0;
      totalMonthlyFees = 0;
      totalYearlyFees = 0;
      totalOneTimeFees = 0;

      Object.keys(byFeeType).forEach(key => {
        byFeeType[key].totalAmount = 0;
      });
    }

    // Determine predominant frequency
    let predominantFrequency = 'yearly';
    let maxCount = 0;
    Object.entries(frequencyCounts).forEach(([freq, count]) => {
      if (count > maxCount) {
        maxCount = count;
        predominantFrequency = freq;
      }
    });

    setFinancialData({
      totalRevenue,
      totalMonthlyFees,
      totalYearlyFees,
      totalOneTimeFees,
      byFeeType,
      feeCount: assignments.length,
      predominantFrequency,
      frequencyCounts,
      perStudentRevenue,
      perStudentMonthly,
      perStudentYearly,
      perStudentOneTime,
      perStudentByFeeType
    });
  };

  const getEntityIcon = () => {
    switch (entityType) {
      case 'class':
        return <School className="h-6 w-6 text-blue-600" />;
      case 'busStop':
        return <MapPin className="h-6 w-6 text-green-600" />;
      default:
        return <DollarSign className="h-6 w-6 text-gray-600" />;
    }
  };

  const getEntityColor = () => {
    switch (entityType) {
      case 'class':
        return {
          gradient: 'from-blue-50 to-indigo-50',
          icon: 'text-blue-600',
          button: 'bg-blue-600 hover:bg-blue-700'
        };
      case 'busStop':
        return {
          gradient: 'from-green-50 to-emerald-50',
          icon: 'text-green-600',
          button: 'bg-green-600 hover:bg-green-700'
        };
      default:
        return {
          gradient: 'from-gray-50 to-gray-100',
          icon: 'text-gray-600',
          button: 'bg-gray-600 hover:bg-gray-700'
        };
    }
  };

  const colors = getEntityColor();

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-24 bg-gray-100 rounded"></div>
            <div className="h-24 bg-gray-100 rounded"></div>
            <div className="h-24 bg-gray-100 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <DollarSign className="h-6 w-6 text-green-600" />
          Finance Information Summary
        </h2>
        <button
          onClick={onConfigureFees}
          className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          Configure Fees
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Check if any fees are defined */}
      {financialData.feeCount === 0 ? (
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <p className="text-gray-600 font-medium mb-2">No Fee Structure Defined</p>
          <p className="text-sm text-gray-500 mb-4">
            Please configure fee assignments for this {entityType === 'busStop' ? 'bus stop' : 'class'}.
          </p>
          <button
            onClick={onConfigureFees}
            className={`px-4 py-2 text-white rounded-lg transition duration-200 ${colors.button}`}
          >
            Configure Fees
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Total Revenue */}
            <div className={`bg-gradient-to-br ${colors.gradient} p-4 rounded-lg`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">
                  {financialData.predominantFrequency === 'monthly'
                    ? 'Total Monthly Revenue'
                    : 'Total Annual Revenue'}
                </span>
                <TrendingUp className={`h-4 w-4 ${colors.icon}`} />
              </div>
              <p className="text-2xl font-bold text-gray-800">
                ₹{(financialData.predominantFrequency === 'monthly'
                  ? financialData.totalMonthlyFees
                  : financialData.totalRevenue).toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {actualStudentCount > 0
                  ? `Based on ${actualStudentCount} ${entityType === 'busStop' ? 'allocated' : 'enrolled'} students`
                  : `No students ${entityType === 'busStop' ? 'allocated' : 'enrolled'} yet`
                }
              </p>
              <div className="mt-2 text-xs text-gray-600">
                {actualStudentCount === 0 ? (
                  <div className="text-yellow-600 font-medium">
                    Fee structure: ₹{(
                      financialData.predominantFrequency === 'monthly'
                        ? financialData.perStudentMonthly
                        : financialData.perStudentRevenue
                    ).toLocaleString('en-IN')} per student/{financialData.predominantFrequency === 'monthly' ? 'month' : 'year'}
                  </div>
                ) : (
                  <>
                    {financialData.predominantFrequency === 'monthly' && financialData.totalRevenue > 0 && (
                      <div>Annual projection: ₹{financialData.totalRevenue.toLocaleString('en-IN')}</div>
                    )}
                    {financialData.predominantFrequency !== 'monthly' && financialData.totalMonthlyFees > 0 && (
                      <div>Monthly equivalent: ₹{(financialData.totalRevenue / 12).toFixed(0).toLocaleString('en-IN')}</div>
                    )}
                    <div>Per student: ₹{(
                      financialData.predominantFrequency === 'monthly'
                        ? financialData.totalMonthlyFees / actualStudentCount
                        : financialData.totalRevenue / actualStudentCount
                    ).toFixed(0).toLocaleString('en-IN')}/{financialData.predominantFrequency === 'monthly' ? 'month' : 'year'}</div>
                  </>
                )}
              </div>
            </div>

            {/* Fee Frequency Breakdown */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Fee Components</span>
                <DollarSign className="h-4 w-4 text-orange-600" />
              </div>
              <div className="space-y-1">
                {(financialData.totalMonthlyFees > 0 || financialData.perStudentMonthly > 0) && (
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Monthly:</span>
                    <span className="font-medium">
                      {actualStudentCount > 0
                        ? `₹${financialData.totalMonthlyFees.toLocaleString('en-IN')}`
                        : `₹${financialData.perStudentMonthly.toLocaleString('en-IN')}/student`
                      }
                    </span>
                  </div>
                )}
                {(financialData.totalYearlyFees > 0 || financialData.perStudentYearly > 0) && (
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Yearly:</span>
                    <span className="font-medium">
                      {actualStudentCount > 0
                        ? `₹${financialData.totalYearlyFees.toLocaleString('en-IN')}`
                        : `₹${financialData.perStudentYearly.toLocaleString('en-IN')}/student`
                      }
                    </span>
                  </div>
                )}
                {(financialData.totalOneTimeFees > 0 || financialData.perStudentOneTime > 0) && (
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">One-time:</span>
                    <span className="font-medium">
                      {actualStudentCount > 0
                        ? `₹${financialData.totalOneTimeFees.toLocaleString('en-IN')}`
                        : `₹${financialData.perStudentOneTime.toLocaleString('en-IN')}/student`
                      }
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Fee Structure Info */}
            <div className={`bg-gradient-to-br ${colors.gradient} p-4 rounded-lg`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Students & Fees</span>
                <Users className={`h-4 w-4 ${colors.icon}`} />
              </div>
              <p className="text-2xl font-bold text-gray-800">{actualStudentCount}</p>
              <p className="text-xs text-gray-500 mt-1">
                {entityType === 'busStop' ? 'Students using stop' : 'Enrolled students'}
              </p>
              <div className="mt-2 text-xs text-gray-600">
                <div>{financialData.feeCount} active fees</div>
                <div>{Object.keys(financialData.byFeeType).length} fee types</div>
              </div>
            </div>
          </div>

          {/* Fee Type Breakdown */}
          {Object.keys(financialData.byFeeType).length > 0 && (
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Fee Type Breakdown</h3>
              <div className="space-y-2">
                {Object.entries(financialData.byFeeType).map(([typeName, typeData]) => (
                  <div key={typeName} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-700">{typeName}</span>
                      <span className="text-xs text-gray-500 ml-2">
                        ({typeData.count} {typeData.count === 1 ? 'fee' : 'fees'})
                      </span>
                    </div>
                    <div className="text-right">
                      {actualStudentCount > 0 ? (
                        <>
                          <span className="text-sm font-semibold text-gray-800">
                            ₹{(financialData.predominantFrequency === 'monthly' && financialData.totalMonthlyFees > 0
                              ? (typeData.totalAmount / 12).toFixed(0)
                              : typeData.totalAmount
                            ).toLocaleString('en-IN')}
                          </span>
                          <span className="text-xs text-gray-500 ml-1">
                            /{financialData.predominantFrequency === 'monthly' ? 'month' : 'year'}
                          </span>
                        </>
                      ) : (
                        <span className="text-xs text-yellow-600 font-medium">
                          ₹{(financialData.predominantFrequency === 'monthly' && financialData.perStudentByFeeType?.[typeName]
                            ? (financialData.perStudentByFeeType[typeName] / 12).toFixed(0)
                            : financialData.perStudentByFeeType?.[typeName] || 0
                          ).toLocaleString('en-IN')}/student
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FinanceSummary;