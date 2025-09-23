import React, { useState, useEffect } from 'react';
import { Calendar, DollarSign, User, AlertCircle, Search, Filter, RefreshCw, ChevronRight, Clock, CheckCircle, XCircle } from 'lucide-react';
import { usePaymentScheduleService } from '../../../../application/hooks/useServices';
import { useNavigate } from 'react-router-dom';
import Alert from '../../../components/students/Alert';

const PaymentSchedules = () => {
  const paymentScheduleService = usePaymentScheduleService();
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await paymentScheduleService.getAllSchedules();

      if (result.success) {
        setSchedules(result.data || []);
      } else {
        setError(result.error || 'Failed to fetch payment schedules');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch payment schedules');
    } finally {
      setLoading(false);
    }
  };

  const fetchScheduleDetails = async (scheduleId) => {
    // Navigate to the detailed schedule view instead of showing modal
    navigate(`/finance/schedules/${scheduleId}`);
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

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'bg-blue-100 text-blue-800', icon: Clock, label: 'Active' },
      completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Completed' },
      cancelled: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Cancelled' },
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle, label: 'Pending' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </span>
    );
  };

  const getCompletionPercentage = (schedule) => {
    if (!schedule.totalAmount || schedule.totalAmount === 0) return 0;
    return Math.round((schedule.paidAmount / schedule.totalAmount) * 100);
  };

  const filteredSchedules = schedules.filter(schedule => {
    const matchesSearch = searchTerm === '' ||
      schedule.scheduleNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.enrollment?.student?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.enrollment?.student?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.enrollment?.gr_no?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || schedule.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate summary stats
  const stats = {
    total: filteredSchedules.length,
    active: filteredSchedules.filter(s => s.status === 'active').length,
    completed: filteredSchedules.filter(s => s.status === 'completed').length,
    totalAmount: filteredSchedules.reduce((sum, s) => sum + (s.totalAmount || 0), 0),
    collectedAmount: filteredSchedules.reduce((sum, s) => sum + (s.paidAmount || 0), 0)
  };

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
              <Calendar className="h-8 w-8 text-indigo-600" />
              Payment Schedules
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage and track all student payment schedules
            </p>
          </div>
          <button
            onClick={fetchSchedules}
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Schedules</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Clock className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Amount</p>
              <p className="text-xl font-bold text-gray-900">{formatAmount(stats.totalAmount)}</p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Collected</p>
              <p className="text-xl font-bold text-green-600">{formatAmount(stats.collectedAmount)}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
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
                placeholder="Search by schedule number, student name, or GR number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Schedules List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {filteredSchedules.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No payment schedules found</h3>
            <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredSchedules.map((schedule) => {
              const completionPercentage = getCompletionPercentage(schedule);

              return (
                <div
                  key={schedule.id}
                  className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => fetchScheduleDetails(schedule.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-indigo-100 rounded-full">
                        <User className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {schedule.enrollment?.student?.first_name} {schedule.enrollment?.student?.last_name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Schedule: {schedule.scheduleNumber}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-xs text-gray-500">
                            GR: {schedule.enrollment?.gr_no || 'N/A'}
                          </span>
                          <span className="text-xs text-gray-500">
                            Class: {schedule.enrollment?.administration?.division?.class?.name || 'N/A'}
                          </span>
                          <span className="text-xs text-gray-500">
                            Academic Year: {schedule.enrollment?.academic_year?.year || 'N/A'}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-gray-700">Payment Progress</span>
                            <span className="text-xs font-medium text-gray-700">{completionPercentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${completionPercentage}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-gray-500">
                              Paid: {formatAmount(schedule.paidAmount)}
                            </span>
                            <span className="text-xs text-gray-500">
                              Total: {formatAmount(schedule.totalAmount)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(schedule.status)}
                      <p className="text-lg font-bold text-gray-900">
                        {formatAmount(schedule.totalAmount - schedule.paidAmount)}
                      </p>
                      <p className="text-xs text-gray-500">Remaining</p>
                      <ChevronRight className="h-5 w-5 text-gray-400 mt-2" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};

export default PaymentSchedules;