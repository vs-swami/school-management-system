import React, { useState, useEffect } from 'react';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Receipt,
  AlertTriangle,
  DollarSign,
  School,
  Calendar,
  ArrowRight,
  Plus,
  RefreshCw,
  Download,
  CheckCircle,
  Clock,
  AlertCircle,
  CreditCard,
  Building,
  Users,
  FileText,
  ShoppingCart
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button, IconButton } from '../../../components/common/Button';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import {
  usePaymentScheduleService,
  useTransactionService,
  useStudentWalletService
} from '../../../../application/hooks/useServices';

const StatCard = ({ title, value, subtitle, icon: Icon, trend, trendValue, color = 'blue', onClick }) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    red: 'bg-red-100 text-red-600',
    purple: 'bg-purple-100 text-purple-600',
    indigo: 'bg-indigo-100 text-indigo-600'
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-sm p-6 cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-1 ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <div className="flex items-center gap-1">
            {trend === 'up' ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500" />
            )}
            <span className={`text-sm ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
              {trendValue}%
            </span>
          </div>
        )}
      </div>
      <div className="space-y-1">
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        <p className="text-sm font-medium text-gray-700">{title}</p>
        {subtitle && (
          <p className="text-xs text-gray-500">{subtitle}</p>
        )}
      </div>
    </div>
  );
};

const RecentTransactionItem = ({ transaction, onClick }) => {
  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTransactionIcon = (type) => {
    return type === 'income' ? (
      <TrendingUp className="w-5 h-5 text-green-500" />
    ) : (
      <TrendingDown className="w-5 h-5 text-red-500" />
    );
  };

  return (
    <div
      className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100 last:border-0"
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gray-50 rounded-lg">
          {getTransactionIcon(transaction.transactionType)}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">{transaction.description}</p>
          <p className="text-xs text-gray-500">
            {new Date(transaction.transactionDate).toLocaleDateString()}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className={`text-sm font-bold ${transaction.transactionType === 'income' ? 'text-green-600' : 'text-red-600'}`}>
          {transaction.transactionType === 'income' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
        </p>
        <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${getStatusColor(transaction.status)}`}>
          {transaction.status}
        </span>
      </div>
    </div>
  );
};

const PendingPaymentItem = ({ payment, onPay }) => (
  <div className="flex items-center justify-between p-4 border-b border-gray-100 last:border-0">
    <div className="flex items-center gap-3">
      <div className="p-2 bg-yellow-50 rounded-lg">
        <Clock className="w-5 h-5 text-yellow-600" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-900">{payment.studentName}</p>
        <p className="text-xs text-gray-500">
          {payment.feeType} - Due: {new Date(payment.dueDate).toLocaleDateString()}
        </p>
        <p className="text-sm font-bold text-gray-900 mt-1">
          ₹{(payment.amount || 0).toLocaleString()}
        </p>
      </div>
    </div>
    <div className="flex items-center gap-2">
      {payment.isOverdue && (
        <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
          Overdue
        </span>
      )}
      <Button
        size="sm"
        variant="primary"
        onClick={() => onPay(payment)}
      >
        Collect
      </Button>
    </div>
  </div>
);

const FinanceDashboard = () => {
  const navigate = useNavigate();
  const paymentScheduleService = usePaymentScheduleService();
  const transactionService = useTransactionService();
  const walletService = useStudentWalletService();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todayCollection: 0,
    monthlyCollection: 0,
    pendingAmount: 0,
    overdueAmount: 0,
    activeWallets: 0,
    totalWalletBalance: 0,
    todayTrend: 0,
    monthlyTrend: 0
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch today's collection
      const todayCollection = await transactionService.getDailyCollection();

      // Fetch recent transactions
      const transactions = await transactionService.getAllTransactions({
        limit: 5,
        sort: 'createdAt:desc'
      });

      // Fetch pending payments
      const pending = await paymentScheduleService.getPendingPayments();

      // Fetch wallet statistics
      const walletStats = await walletService.getWalletStatistics();

      // Calculate monthly collection
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const monthlyStats = await transactionService.getCollectionStatistics(
        startOfMonth.toISOString(),
        new Date().toISOString()
      );

      // Update state
      if (todayCollection.success) {
        setStats(prev => ({
          ...prev,
          todayCollection: todayCollection.data?.totalCollection || 0,
          todayTrend: todayCollection.data?.trend || 0
        }));
      }

      if (monthlyStats.success) {
        setStats(prev => ({
          ...prev,
          monthlyCollection: monthlyStats.data?.totalCollection || 0,
          monthlyTrend: 15 // Calculate actual trend
        }));
      }

      if (pending.success) {
        const pendingData = pending.data || [];
        setPendingPayments(pendingData.slice(0, 5));

        const totalPending = pendingData.reduce((sum, p) => sum + (p.amount || 0), 0);
        const totalOverdue = pendingData
          .filter(p => p.isOverdue)
          .reduce((sum, p) => sum + (p.amount || 0), 0);

        setStats(prev => ({
          ...prev,
          pendingAmount: totalPending,
          overdueAmount: totalOverdue
        }));
      }

      if (walletStats.success) {
        setStats(prev => ({
          ...prev,
          activeWallets: walletStats.data?.activeWallets || 0,
          totalWalletBalance: walletStats.data?.totalBalance || 0
        }));
      }

      if (transactions.success) {
        setRecentTransactions(transactions.data || []);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const handlePaymentClick = (payment) => {
    navigate('/finance/fee-collection', { state: { payment } });
  };

  const handleTransactionClick = (transaction) => {
    navigate(`/finance/transactions/${transaction.id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Finance Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Track collections, payments, and wallet transactions
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => console.log('Export')}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export Report
          </Button>
          <IconButton
            onClick={handleRefresh}
            disabled={refreshing}
            className={refreshing ? 'animate-spin' : ''}
          >
            <RefreshCw className="w-4 h-4" />
          </IconButton>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Today's Collection"
          value={`₹${stats.todayCollection.toLocaleString()}`}
          subtitle="From all payment sources"
          icon={DollarSign}
          trend="up"
          trendValue={stats.todayTrend}
          color="green"
          onClick={() => navigate('/finance/transactions')}
        />
        <StatCard
          title="Monthly Collection"
          value={`₹${stats.monthlyCollection.toLocaleString()}`}
          subtitle="Current month total"
          icon={Building}
          trend="up"
          trendValue={stats.monthlyTrend}
          color="blue"
          onClick={() => navigate('/finance/reports')}
        />
        <StatCard
          title="Pending Fees"
          value={`₹${stats.pendingAmount.toLocaleString()}`}
          subtitle={stats.overdueAmount > 0 ? `₹${stats.overdueAmount.toLocaleString()} overdue` : 'All on schedule'}
          icon={Clock}
          color="yellow"
          onClick={() => navigate('/finance/fee-collection')}
        />
        <StatCard
          title="Active Wallets"
          value={stats.activeWallets}
          subtitle="Student wallets"
          icon={Wallet}
          color="indigo"
          onClick={() => navigate('/finance/wallets')}
        />
        <StatCard
          title="Total Wallet Balance"
          value={`₹${stats.totalWalletBalance.toLocaleString()}`}
          subtitle="Available for purchases"
          icon={CreditCard}
          color="purple"
          onClick={() => navigate('/finance/wallets')}
        />
        <StatCard
          title="Overdue Amount"
          value={`₹${stats.overdueAmount.toLocaleString()}`}
          subtitle={stats.overdueAmount > 0 ? 'Requires attention' : 'No overdue payments'}
          icon={stats.overdueAmount > 0 ? AlertTriangle : CheckCircle}
          color={stats.overdueAmount > 0 ? 'red' : 'green'}
          onClick={() => navigate('/finance/overdue')}
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Button
            variant="primary"
            onClick={() => navigate('/finance/fee-collection')}
            className="w-full flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Collect Fee
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate('/finance/wallets/topup')}
            className="w-full flex items-center justify-center gap-2"
          >
            <Wallet className="w-4 h-4" />
            Topup Wallet
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/finance/transactions')}
            className="w-full flex items-center justify-center gap-2"
          >
            <Receipt className="w-4 h-4" />
            Transactions
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/finance/schedules')}
            className="w-full flex items-center justify-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            Schedules
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
              <button
                onClick={() => navigate('/finance/transactions')}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                View All
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {recentTransactions.length > 0 ? (
              recentTransactions.map(transaction => (
                <RecentTransactionItem
                  key={transaction.id}
                  transaction={transaction}
                  onClick={() => handleTransactionClick(transaction)}
                />
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                No recent transactions
              </div>
            )}
          </div>
        </div>

        {/* Pending Payments */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Pending Payments</h2>
              <button
                onClick={() => navigate('/finance/fee-collection')}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                View All
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {pendingPayments.length > 0 ? (
              <>
                {pendingPayments.map(payment => (
                  <PendingPaymentItem
                    key={payment.id}
                    payment={payment}
                    onPay={handlePaymentClick}
                  />
                ))}
                {stats.overdueAmount > 0 && (
                  <div className="p-4 bg-yellow-50 border-t border-yellow-200">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-600" />
                      <p className="text-sm text-yellow-800">
                        Total overdue amount: ₹{stats.overdueAmount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="p-8 text-center text-gray-500">
                No pending payments
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinanceDashboard;