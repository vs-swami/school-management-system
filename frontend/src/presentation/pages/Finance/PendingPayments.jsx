import React, { useState, useEffect } from 'react';
import { DollarSign, AlertTriangle, Calendar, User, Clock, ChevronRight, Filter, Search, Download, RefreshCw } from 'lucide-react';
import { usePaymentScheduleService } from '../../../application/hooks/useServices';
import Alert from '../../components/students/Alert';
import PaymentProcessingModal from '../../components/Finance/PaymentProcessingModal';

const PendingPayments = () => {
  const paymentScheduleService = usePaymentScheduleService();
  const [pendingPayments, setPendingPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedPayments, setSelectedPayments] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedStudentGroups, setSelectedStudentGroups] = useState({});

  useEffect(() => {
    fetchPendingPayments();
  }, []);

  const fetchPendingPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await paymentScheduleService.getPendingPayments();

      if (result.success) {
        setPendingPayments(result.data || []);
      } else {
        setError(result.error || 'Failed to fetch pending payments');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch pending payments');
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status, isOverdue) => {
    if (isOverdue) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Overdue
        </span>
      );
    }

    switch (status) {
      case 'partial':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Partial
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Pending
          </span>
        );
    }
  };

  const handleSelectPayment = (paymentId) => {
    setSelectedPayments(prev => {
      if (prev.includes(paymentId)) {
        return prev.filter(id => id !== paymentId);
      }
      return [...prev, paymentId];
    });
  };

  const handleSelectAll = () => {
    if (selectedPayments.length === filteredPayments.length) {
      setSelectedPayments([]);
    } else {
      setSelectedPayments(filteredPayments.map(p => p.id));
    }
  };

  const handleSelectStudent = (studentId) => {
    const studentPayments = filteredPayments.filter(p =>
      p.payment_schedule?.enrollment?.student?.id === studentId
    );
    const studentPaymentIds = studentPayments.map(p => p.id);

    const allSelected = studentPaymentIds.every(id => selectedPayments.includes(id));

    if (allSelected) {
      // Deselect all payments for this student
      setSelectedPayments(prev => prev.filter(id => !studentPaymentIds.includes(id)));
    } else {
      // Select all payments for this student
      setSelectedPayments(prev => [...new Set([...prev, ...studentPaymentIds])]);
    }
  };

  const calculateSelectedTotal = () => {
    return selectedPayments.reduce((sum, id) => {
      const payment = pendingPayments.find(p => p.id === id);
      return sum + (payment?.net_amount || 0);
    }, 0);
  };

  const getSelectedPaymentDetails = () => {
    return selectedPayments.map(id => {
      return pendingPayments.find(p => p.id === id);
    }).filter(Boolean);
  };

  const handleProcessPayments = () => {
    if (selectedPayments.length > 0) {
      setShowPaymentModal(true);
    }
  };

  // Group payments by student
  const groupPaymentsByStudent = (payments) => {
    const grouped = {};

    payments.forEach(payment => {
      const studentId = payment.payment_schedule?.enrollment?.student?.id || 'unknown';
      const studentName = payment.payment_schedule?.enrollment?.student ?
        `${payment.payment_schedule.enrollment.student.first_name} ${payment.payment_schedule.enrollment.student.middle_name || ''} ${payment.payment_schedule.enrollment.student.last_name}`.trim() :
        'Unknown Student';

      if (!grouped[studentId]) {
        grouped[studentId] = {
          studentId,
          studentName,
          student: payment.payment_schedule?.enrollment?.student,
          enrollment: payment.payment_schedule?.enrollment,
          payments: [],
          totalDue: 0,
          totalOverdue: 0
        };
      }

      grouped[studentId].payments.push(payment);
      grouped[studentId].totalDue += payment.net_amount || 0;
      if (payment.isOverdue) {
        grouped[studentId].totalOverdue += payment.net_amount || 0;
      }
    });

    return Object.values(grouped);
  };

  // Filter payments
  const filteredPayments = pendingPayments.filter(payment => {
    const matchesSearch = searchTerm === '' ||
      payment.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.payment_schedule?.enrollment?.student?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.payment_schedule?.enrollment?.student?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.payment_schedule?.schedule_number?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterStatus === 'all' ||
      (filterStatus === 'overdue' && payment.isOverdue) ||
      (filterStatus === 'pending' && !payment.isOverdue && payment.status === 'pending') ||
      (filterStatus === 'partial' && payment.status === 'partial');

    return matchesSearch && matchesFilter;
  });

  const groupedPayments = groupPaymentsByStudent(filteredPayments);

  // Calculate totals
  const totalAmount = filteredPayments.reduce((sum, p) => sum + (p.net_amount || 0), 0);
  const totalOverdue = filteredPayments.filter(p => p.isOverdue).reduce((sum, p) => sum + (p.net_amount || 0), 0);
  const totalPending = filteredPayments.filter(p => !p.isOverdue).reduce((sum, p) => sum + (p.net_amount || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <DollarSign className="h-8 w-8 text-indigo-600" />
              Pending Payments
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage and track all pending student payments
            </p>
          </div>
          <button
            onClick={fetchPendingPayments}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <Alert type="error" message={error} />
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Pending</p>
              <p className="text-2xl font-bold text-gray-900">{formatAmount(totalAmount)}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue Amount</p>
              <p className="text-2xl font-bold text-red-600">{formatAmount(totalOverdue)}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Due Soon</p>
              <p className="text-2xl font-bold text-yellow-600">{formatAmount(totalPending)}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by student name, schedule number, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="overdue">Overdue</option>
              <option value="pending">Pending</option>
              <option value="partial">Partial</option>
            </select>

          </div>
        </div>
      </div>

      {/* Payments List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {groupedPayments.length === 0 ? (
          <div className="p-12 text-center">
            <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No pending payments</h3>
            <p className="mt-1 text-sm text-gray-500">All payments are up to date</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {groupedPayments.map((group) => {
              const studentPaymentIds = group.payments.map(p => p.id);
              const allStudentPaymentsSelected = studentPaymentIds.every(id => selectedPayments.includes(id));
              const someStudentPaymentsSelected = studentPaymentIds.some(id => selectedPayments.includes(id));

              return (
                <div key={group.studentId} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={allStudentPaymentsSelected}
                        indeterminate={someStudentPaymentsSelected && !allStudentPaymentsSelected}
                        onChange={() => handleSelectStudent(group.studentId)}
                        className="h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500"
                      />
                      <div className="p-2 bg-indigo-100 rounded-full">
                        <User className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{group.studentName}</h3>
                        <p className="text-sm text-gray-500">
                          GR: {group.enrollment?.gr_no} | Class: {group.enrollment?.class?.name || 'N/A'}
                        </p>
                      </div>
                    </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">{formatAmount(group.totalDue)}</p>
                    {group.totalOverdue > 0 && (
                      <p className="text-sm text-red-600 font-medium">
                        {formatAmount(group.totalOverdue)} overdue
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  {group.payments.map((payment) => (
                    <div
                      key={payment.id}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        payment.isOverdue ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedPayments.includes(payment.id)}
                          onChange={() => handleSelectPayment(payment.id)}
                          className="h-4 w-4 text-indigo-600 rounded focus:ring-indigo-500"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{payment.description}</p>
                          <div className="flex items-center gap-4 mt-1">
                            <p className="text-xs text-gray-500">
                              <Calendar className="inline h-3 w-3 mr-1" />
                              Due: {formatDate(payment.due_date)}
                            </p>
                            <p className="text-xs text-gray-500">
                              Fee: {payment.fee_definition?.name}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {getStatusBadge(payment.status, payment.isOverdue)}
                        <p className="font-semibold text-gray-900">{formatAmount(payment.net_amount)}</p>
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          </div>
        )}
      </div>

      {/* Floating Process Payment Button */}
      {selectedPayments.length > 0 && (
        <div className="fixed bottom-6 right-6 bg-white rounded-lg shadow-2xl border border-gray-200 p-4 z-50">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-sm text-gray-600">{selectedPayments.length} items selected</p>
              <p className="text-lg font-bold text-gray-900">{formatAmount(calculateSelectedTotal())}</p>
            </div>
            <button
              onClick={handleProcessPayments}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              <DollarSign className="h-5 w-5" />
              Process Payment
            </button>
          </div>
        </div>
      )}

      {/* Payment Processing Modal */}
      <PaymentProcessingModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        selectedItems={getSelectedPaymentDetails()}
        onSuccess={(result) => {
          // Refresh the pending payments list
          fetchPendingPayments();
          // Clear selections
          setSelectedPayments([]);
          setShowPaymentModal(false);
        }}
      />
    </div>
  );
};

export default PendingPayments;