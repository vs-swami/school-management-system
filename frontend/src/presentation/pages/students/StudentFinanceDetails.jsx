import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  User,
  Calendar,
  DollarSign,
  CreditCard,
  FileText,
  ChevronRight,
  ArrowLeft,
  Home,
  Receipt,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Download,
  RefreshCw
} from 'lucide-react';
import { useServices } from '../../../application/hooks/useServices';

const StudentFinanceDetails = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const {
    student: studentService,
    paymentSchedule: paymentScheduleService,
    transaction: transactionService,
    enrollment: enrollmentService
  } = useServices();

  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  useEffect(() => {
    fetchStudentFinanceData();
  }, [studentId]);

  const fetchStudentFinanceData = async () => {
    try {
      setLoading(true);

      // Fetch student details with enrollments
      const studentResult = await studentService.getStudentById(studentId);
      if (studentResult.success && studentResult.data) {
        setStudent(studentResult.data);

        // Extract enrollments from student data
        if (studentResult.data.enrollments) {
          setEnrollments(studentResult.data.enrollments);
        }
      }

      // Fetch payment schedules - try getting ALL schedules for debugging
      try {
        // First try the student-specific endpoint
        const scheduleResult = await paymentScheduleService.getStudentPaymentSchedule(studentId);
        console.log('Schedule Service Result:', scheduleResult);

        if (scheduleResult.success && scheduleResult.data) {
          const schedulesData = Array.isArray(scheduleResult.data) ? scheduleResult.data :
                                (scheduleResult.data?.data ? scheduleResult.data.data : []);
          console.log('Schedules to set:', schedulesData);
          setSchedules(schedulesData || []);
        } else {
          // If no schedules found, try getting all schedules and filter client-side
          console.log('No schedules from student endpoint, trying all schedules...');
          const allSchedulesResult = await paymentScheduleService.getAllSchedules();

          if (allSchedulesResult.success && allSchedulesResult.data) {
            // Filter schedules for this student
            const studentSchedules = allSchedulesResult.data.filter(schedule => {
              const enrollmentStudentId = schedule.enrollment?.student?.id;
              return enrollmentStudentId && enrollmentStudentId.toString() === studentId.toString();
            });
            console.log('Filtered student schedules:', studentSchedules);
            setSchedules(studentSchedules);
          } else {
            console.log('Failed to fetch schedules:', scheduleResult.error);
            setSchedules([]);
          }
        }
      } catch (error) {
        console.error('Error fetching schedules:', error);
        setSchedules([]);
      }

      // Fetch transactions
      const transactionResult = await transactionService.getStudentTransactions(studentId);
      if (transactionResult.success) {
        setTransactions(transactionResult.data || []);
      }
    } catch (error) {
      console.error('Error fetching student finance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateFinancialSummary = () => {
    // Use camelCase fields as mapped by PaymentScheduleMapper
    const totalFees = schedules.reduce((sum, s) => {
      return sum + (s.totalAmount || 0);
    }, 0);

    const totalPaid = schedules.reduce((sum, s) => {
      return sum + (s.paidAmount || 0);
    }, 0);

    const totalPending = totalFees - totalPaid;

    const overdueAmount = schedules.reduce((sum, schedule) => {
      const items = schedule.paymentItems || [];
      if (items && items.length > 0) {
        const overdue = items
          .filter(item => {
            const status = item.status || 'pending';
            return status !== 'paid' && item.dueDate && new Date(item.dueDate) < new Date();
          })
          .reduce((itemSum, item) => {
            return itemSum + (item.netAmount || item.amount || 0);
          }, 0);
        return sum + overdue;
      }
      return sum;
    }, 0);

    return {
      totalFees,
      totalPaid,
      totalPending,
      overdueAmount,
      paymentProgress: totalFees > 0 ? Math.round((totalPaid / totalFees) * 100) : 0
    };
  };

  const financialSummary = calculateFinancialSummary();

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: { bg: 'bg-blue-100', text: 'text-blue-800', icon: Clock },
      completed: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: AlertCircle },
      paid: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      overdue: { bg: 'bg-red-100', text: 'text-red-800', icon: AlertCircle }
    };

    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        <Icon className="w-3 h-3" />
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600">
        <Link to="/dashboard" className="hover:text-blue-600 flex items-center gap-1">
          <Home className="w-4 h-4" />
          Dashboard
        </Link>
        <ChevronRight className="w-4 h-4" />
        <Link to="/students" className="hover:text-blue-600">
          Students
        </Link>
        <ChevronRight className="w-4 h-4" />
        <Link to={`/students/view/${studentId}`} className="hover:text-blue-600">
          {student?.first_name || student?.firstName} {student?.last_name || student?.lastName}
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900 font-medium">Finance Details</span>
      </nav>

      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-start">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {student?.first_name || student?.firstName} {student?.last_name || student?.lastName}
              </h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                <span>GR: {student?.gr_no || student?.registrationNumber || 'N/A'}</span>
                <span>•</span>
                <span>Student ID: {student?.ssa_uid || student?.apaar_id || 'N/A'}</span>
                <span>•</span>
                <span>Class: {enrollments[0]?.class?.name || enrollments[0]?.className || 'N/A'}</span>
                <span>•</span>
                <span>Contact: {student?.contact_number || student?.contactNumber || 'N/A'}</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>

        {/* Financial Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Fees</p>
                <p className="text-xl font-bold text-gray-900">{formatAmount(financialSummary.totalFees)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-gray-400" />
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">Total Paid</p>
                <p className="text-xl font-bold text-green-900">{formatAmount(financialSummary.totalPaid)}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </div>

          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600">Pending</p>
                <p className="text-xl font-bold text-yellow-900">{formatAmount(financialSummary.totalPending)}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-400" />
            </div>
          </div>

          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600">Overdue</p>
                <p className="text-xl font-bold text-red-900">{formatAmount(financialSummary.overdueAmount)}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">Progress</p>
                <p className="text-xl font-bold text-blue-900">{financialSummary.paymentProgress}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            {['overview', 'schedules', 'transactions'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Current Enrollments */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Enrollments</h3>
                <div className="space-y-3">
                  {enrollments.map((enrollment) => (
                    <div key={enrollment.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">
                            {enrollment.academicYear?.year || enrollment.academic_year?.year || 'Academic Year N/A'}
                          </p>
                          <p className="text-sm text-gray-600">
                            Class: {enrollment.class?.name || enrollment.className || 'N/A'} |
                            Division: {enrollment.division?.name || enrollment.divisionName || 'N/A'}
                          </p>
                          <p className="text-sm text-gray-600">
                            Admission Type: {enrollment.admissionType || enrollment.admission_type || 'N/A'} |
                            Payment: {enrollment.paymentPreference || enrollment.payment_preference || 'N/A'}
                          </p>
                        </div>
                        <Link
                          to={`/enrollments/${enrollment.id}`}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Summary */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Summary</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Annual Fees:</span>
                      <span className="font-medium">{formatAmount(financialSummary.totalFees)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount Paid:</span>
                      <span className="font-medium text-green-600">{formatAmount(financialSummary.totalPaid)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pending Amount:</span>
                      <span className="font-medium text-yellow-600">{formatAmount(financialSummary.totalPending)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Overdue Amount:</span>
                      <span className="font-medium text-red-600">{formatAmount(financialSummary.overdueAmount)}</span>
                    </div>
                    <div className="pt-2 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Payment Progress:</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${financialSummary.paymentProgress}%` }}
                            />
                          </div>
                          <span className="font-medium">{financialSummary.paymentProgress}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Schedules Tab */}
          {activeTab === 'schedules' && (
            <div className="space-y-4">
              {schedules.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No payment schedules found
                </div>
              ) : (
                schedules.map((schedule) => (
                  <div key={schedule.id} className="border rounded-lg overflow-hidden">
                    <div
                      className="p-4 bg-gray-50 cursor-pointer hover:bg-gray-100"
                      onClick={() => setSelectedSchedule(
                        selectedSchedule?.id === schedule.id ? null : schedule
                      )}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-gray-900">
                            {schedule.scheduleNumber || `Schedule #${schedule.id}`}
                          </p>
                          <p className="text-sm text-gray-600">
                            Total: {formatAmount(schedule.totalAmount || 0)} |
                            Paid: {formatAmount(schedule.paidAmount || 0)} |
                            Pending: {formatAmount((schedule.totalAmount || 0) - (schedule.paidAmount || 0))}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          {getStatusBadge(schedule.status)}
                          <Link
                            to={`/finance/schedules/${schedule.id}`}
                            className="text-blue-600 hover:text-blue-700"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <ChevronRight
                            className={`w-5 h-5 text-gray-400 transform transition-transform ${
                              selectedSchedule?.id === schedule.id ? 'rotate-90' : ''
                            }`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Payment Items */}
                    {selectedSchedule?.id === schedule.id && schedule.paymentItems && (
                      <div className="border-t">
                        <div className="p-4">
                          <h4 className="text-sm font-semibold text-gray-700 mb-3">Payment Items</h4>
                          <div className="space-y-2">
                            {schedule.paymentItems.map((item, index) => (
                              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {item.description}
                                  </p>
                                  <p className="text-xs text-gray-600">
                                    Due: {formatDate(item.dueDate)}
                                  </p>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="font-medium">{formatAmount(item.amount)}</span>
                                  {getStatusBadge(
                                    item.status === 'paid' ? 'paid' :
                                    new Date(item.dueDate) < new Date() ? 'overdue' : 'pending'
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Transactions Tab */}
          {activeTab === 'transactions' && (
            <div className="space-y-4">
              {transactions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No transactions found
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-medium text-gray-700">Transaction</th>
                        <th className="text-left p-3 font-medium text-gray-700">Date</th>
                        <th className="text-left p-3 font-medium text-gray-700">Schedule</th>
                        <th className="text-left p-3 font-medium text-gray-700">Amount</th>
                        <th className="text-left p-3 font-medium text-gray-700">Method</th>
                        <th className="text-left p-3 font-medium text-gray-700">Status</th>
                        <th className="text-left p-3 font-medium text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {transactions.map((transaction) => {
                        const paymentItem = transaction.paymentItems?.[0];
                        const schedule = paymentItem?.payment_schedule;

                        return (
                          <tr key={transaction.id} className="hover:bg-gray-50">
                            <td className="p-3">
                              <div>
                                <p className="font-medium text-gray-900">
                                  {transaction.transactionNumber}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {transaction.receiptNumber}
                                </p>
                              </div>
                            </td>
                            <td className="p-3 text-sm text-gray-700">
                              {formatDate(transaction.transactionDate)}
                            </td>
                            <td className="p-3">
                              {schedule ? (
                                <Link
                                  to={`/finance/schedules/${schedule.id}`}
                                  className="text-blue-600 hover:text-blue-700 text-sm"
                                >
                                  {schedule.schedule_number}
                                </Link>
                              ) : (
                                <span className="text-sm text-gray-400">No schedule</span>
                              )}
                            </td>
                            <td className="p-3">
                              <span className="font-medium text-green-600">
                                +{formatAmount(transaction.amount)}
                              </span>
                            </td>
                            <td className="p-3 text-sm text-gray-700 capitalize">
                              {transaction.paymentMethod?.replace('_', ' ')}
                            </td>
                            <td className="p-3">
                              {getStatusBadge(transaction.status)}
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <Link
                                  to={`/finance/transactions/${transaction.id}`}
                                  className="text-blue-600 hover:text-blue-700"
                                >
                                  <Eye className="w-4 h-4" />
                                </Link>
                                <button className="text-gray-600 hover:text-gray-700">
                                  <Download className="w-4 h-4" />
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentFinanceDetails;