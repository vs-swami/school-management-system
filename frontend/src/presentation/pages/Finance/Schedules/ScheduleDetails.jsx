import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Calendar,
  User,
  DollarSign,
  FileText,
  ChevronRight,
  ArrowLeft,
  Home,
  Download,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  CreditCard,
  RefreshCw,
  Receipt,
  TrendingUp
} from 'lucide-react';
import { useServices } from '../../../../application/hooks/useServices';

const ScheduleDetails = () => {
  const { scheduleId } = useParams();
  const navigate = useNavigate();
  const {
    paymentSchedule: paymentScheduleService,
    transaction: transactionService
  } = useServices();

  const [loading, setLoading] = useState(true);
  const [schedule, setSchedule] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState('items');
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    fetchScheduleDetails();
  }, [scheduleId]);

  const fetchScheduleDetails = async () => {
    try {
      setLoading(true);

      // Fetch schedule with all details
      const scheduleResult = await paymentScheduleService.getScheduleSummary(scheduleId);
      if (scheduleResult.success) {
        setSchedule(scheduleResult.data);
      }

      // Fetch related transactions
      const transactionsResult = await transactionService.getStudentFinanceTransactions();

      if (transactionsResult.success && transactionsResult.data) {
        // Filter transactions that belong to this specific schedule
        const scheduleTransactions = transactionsResult.data.filter(transaction => {
          // Check if this transaction has payment items related to this schedule
          return transaction.paymentItems?.some(item => {
            // Check both camelCase and snake_case for payment schedule reference
            const scheduleRef = item.paymentSchedule || item.payment_schedule;

            // Handle if scheduleRef is an object with id or just the id directly
            if (typeof scheduleRef === 'object' && scheduleRef !== null) {
              return scheduleRef.id?.toString() === scheduleId.toString();
            }
            return scheduleRef?.toString() === scheduleId.toString();
          });
        });

        console.log(`Found ${scheduleTransactions.length} transactions for schedule ${scheduleId}`);
        setTransactions(scheduleTransactions);
      }
    } catch (error) {
      console.error('Error fetching schedule details:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const getStatusBadge = (status, dueDate = null) => {
    let effectiveStatus = status;
    if (status === 'pending' && dueDate && new Date(dueDate) < new Date()) {
      effectiveStatus = 'overdue';
    }

    const badges = {
      active: { bg: 'bg-blue-100', text: 'text-blue-800', icon: Clock },
      completed: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
      paid: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      overdue: { bg: 'bg-red-100', text: 'text-red-800', icon: AlertCircle },
      partially_paid: { bg: 'bg-orange-100', text: 'text-orange-800', icon: Clock }
    };

    const badge = badges[effectiveStatus] || badges.pending;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        <Icon className="w-3 h-3" />
        {effectiveStatus.replace('_', ' ')}
      </span>
    );
  };

  const handlePayItem = (item) => {
    // Navigate to fee collection with pre-selected item
    navigate('/finance/fee-collection', {
      state: {
        scheduleId: schedule.schedule?.id,
        selectedItems: [item.id],
        student: schedule.schedule?.enrollment?.student
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!schedule) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Schedule not found</h3>
          <button
            onClick={() => navigate('/finance/schedules')}
            className="mt-4 text-blue-600 hover:text-blue-700"
          >
            Back to Schedules
          </button>
        </div>
      </div>
    );
  }

  const { schedule: scheduleData, stats } = schedule;
  const student = scheduleData?.enrollment?.student;
  const enrollment = scheduleData?.enrollment;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600">
        <Link to="/finance" className="hover:text-blue-600 flex items-center gap-1">
          <Home className="w-4 h-4" />
          Finance
        </Link>
        <ChevronRight className="w-4 h-4" />
        <Link to="/finance/schedules" className="hover:text-blue-600">
          Schedules
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900">{scheduleData?.scheduleNumber}</span>
      </nav>

      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="w-8 h-8 text-blue-600" />
              Payment Schedule Details
            </h1>
            <p className="mt-2 text-gray-600">{scheduleData?.scheduleNumber}</p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>

        {/* Student & Enrollment Info */}
        {student && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-start">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <Link
                    to={`/students/${student.id}/finance`}
                    className="font-medium text-gray-900 hover:text-blue-600 flex items-center gap-1"
                  >
                    {student.first_name || student.firstName} {student.last_name || student.lastName}
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                    <span>GR: {student.gr_number || student.registrationNumber || 'N/A'}</span>
                    <span>•</span>
                    <span>Class: {enrollment?.class?.name || 'N/A'}</span>
                    <span>•</span>
                    <span>Academic Year: {enrollment?.academic_year?.name || 'N/A'}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Payment Preference</p>
                <p className="font-medium capitalize">{enrollment?.payment_preference || 'N/A'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Financial Summary */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Total Amount</p>
                <p className="text-lg font-bold text-gray-900">{formatAmount(stats?.totalAmount)}</p>
              </div>
              <DollarSign className="w-6 h-6 text-gray-400" />
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-green-600">Paid Amount</p>
                <p className="text-lg font-bold text-green-900">{formatAmount(stats?.paidAmount)}</p>
              </div>
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
          </div>

          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-yellow-600">Pending Amount</p>
                <p className="text-lg font-bold text-yellow-900">{formatAmount(stats?.pendingAmount)}</p>
              </div>
              <Clock className="w-6 h-6 text-yellow-400" />
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-600">Items Status</p>
                <p className="text-lg font-bold text-blue-900">
                  {stats?.paidItems}/{stats?.totalItems}
                </p>
              </div>
              <Receipt className="w-6 h-6 text-blue-400" />
            </div>
          </div>

          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-red-600">Overdue Items</p>
                <p className="text-lg font-bold text-red-900">{stats?.overdueItems}</p>
              </div>
              <AlertCircle className="w-6 h-6 text-red-400" />
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Payment Progress</span>
            <span className="text-sm font-medium text-gray-700">
              {stats?.totalAmount > 0 ? Math.round((stats?.paidAmount / stats?.totalAmount) * 100) : 0}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{
                width: `${stats?.totalAmount > 0 ? (stats?.paidAmount / stats?.totalAmount) * 100 : 0}%`
              }}
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            {['items', 'transactions', 'timeline'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab === 'items' ? 'Payment Items' : tab}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Payment Items Tab */}
          {activeTab === 'items' && (
            <div className="space-y-4">
              {(!scheduleData?.paymentItems || scheduleData.paymentItems.length === 0) ? (
                <div className="text-center py-8 text-gray-500">
                  No payment items found
                </div>
              ) : (
                scheduleData.paymentItems.map((item, index) => {
                  const isOverdue = item.status === 'pending' && new Date(item.dueDate) < new Date();
                  const relatedTransactions = transactions.filter(t =>
                    t.paymentItems?.some(pi => pi.id === item.id)
                  );

                  return (
                    <div
                      key={item.id || index}
                      className={`border rounded-lg p-4 ${
                        isOverdue ? 'border-red-200 bg-red-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-gray-900">{item.description}</p>
                              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                <span>Due Date: {formatDate(item.dueDate)}</span>
                                {item.installmentNumber && (
                                  <>
                                    <span>•</span>
                                    <span>Installment #{item.installmentNumber}</span>
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-gray-900">
                                {formatAmount(item.netAmount)}
                              </p>
                              {item.paidAmount > 0 && item.paidAmount < item.netAmount && (
                                <p className="text-sm text-gray-600">
                                  Paid: {formatAmount(item.paidAmount)}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Related Transactions */}
                          {relatedTransactions.length > 0 && (
                            <div className="mt-3 pt-3 border-t">
                              <p className="text-sm font-medium text-gray-700 mb-2">Related Transactions:</p>
                              <div className="space-y-1">
                                {relatedTransactions.map(txn => (
                                  <Link
                                    key={txn.id}
                                    to={`/finance/transactions/${txn.id}`}
                                    className="flex items-center justify-between text-sm p-2 bg-white rounded hover:bg-gray-50"
                                  >
                                    <span className="text-blue-600 hover:text-blue-700">
                                      {txn.transactionNumber}
                                    </span>
                                    <span className="text-gray-600">
                                      {formatDate(txn.transactionDate)} • {formatAmount(txn.amount)}
                                    </span>
                                  </Link>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="ml-4 flex items-center gap-2">
                          {getStatusBadge(item.status, item.dueDate)}
                          {item.status === 'pending' && (
                            <button
                              onClick={() => handlePayItem(item)}
                              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                            >
                              Pay Now
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Transactions Tab */}
          {activeTab === 'transactions' && (
            <div className="space-y-4">
              {transactions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No transactions found for this schedule
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-medium text-gray-700">Transaction</th>
                        <th className="text-left p-3 font-medium text-gray-700">Date</th>
                        <th className="text-left p-3 font-medium text-gray-700">Payment Items</th>
                        <th className="text-left p-3 font-medium text-gray-700">Amount</th>
                        <th className="text-left p-3 font-medium text-gray-700">Method</th>
                        <th className="text-left p-3 font-medium text-gray-700">Status</th>
                        <th className="text-left p-3 font-medium text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {transactions.map((transaction) => (
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
                            <div className="text-sm">
                              {transaction.paymentItems?.map((item, idx) => (
                                <div key={idx}>{item.description}</div>
                              ))}
                            </div>
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
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Timeline Tab */}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                {/* Schedule Created */}
                <div className="relative flex items-start mb-6">
                  <div className="absolute left-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-white" />
                  </div>
                  <div className="ml-12">
                    <p className="font-medium text-gray-900">Schedule Created</p>
                    <p className="text-sm text-gray-600">{formatDate(scheduleData?.generatedAt)}</p>
                  </div>
                </div>

                {/* Transactions Timeline */}
                {transactions.map((transaction, index) => (
                  <div key={transaction.id} className="relative flex items-start mb-6">
                    <div className="absolute left-0 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                      <DollarSign className="w-4 h-4 text-white" />
                    </div>
                    <div className="ml-12">
                      <p className="font-medium text-gray-900">
                        Payment Received: {formatAmount(transaction.amount)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatDate(transaction.transactionDate)} • {transaction.paymentMethod}
                      </p>
                      <Link
                        to={`/finance/transactions/${transaction.id}`}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        View Transaction →
                      </Link>
                    </div>
                  </div>
                ))}

                {/* Current Status */}
                <div className="relative flex items-start">
                  <div className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    scheduleData?.status === 'completed' ? 'bg-green-600' : 'bg-yellow-600'
                  }`}>
                    {scheduleData?.status === 'completed' ? (
                      <CheckCircle className="w-4 h-4 text-white" />
                    ) : (
                      <Clock className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div className="ml-12">
                    <p className="font-medium text-gray-900">
                      Current Status: {scheduleData?.status}
                    </p>
                    <p className="text-sm text-gray-600">
                      {stats?.pendingAmount > 0
                        ? `Pending: ${formatAmount(stats.pendingAmount)}`
                        : 'Fully Paid'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScheduleDetails;