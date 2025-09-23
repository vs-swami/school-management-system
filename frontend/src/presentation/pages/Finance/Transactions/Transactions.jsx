import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useServices } from '../../../../application/hooks/useServices';
import {
  Search,
  Filter,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Calendar,
  DollarSign,
  CreditCard,
  FileText,
  Eye,
  Printer,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  Clock,
  ArrowUpDown,
  Link,
  User,
  BookOpen,
  Receipt
} from 'lucide-react';

const Transactions = () => {
  const navigate = useNavigate();
  const { transaction: transactionService } = useServices();

  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    status: 'all',
    type: 'all',
    paymentMethod: 'all',
    minAmount: '',
    maxAmount: ''
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Sorting
  const [sortConfig, setSortConfig] = useState({
    key: 'transactionDate',
    direction: 'desc'
  });

  // Statistics
  const [stats, setStats] = useState({
    totalTransactions: 0,
    totalAmount: 0,
    completedCount: 0,
    pendingCount: 0,
    failedCount: 0
  });

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [transactions, searchQuery, filters, sortConfig]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const result = await transactionService.getStudentFinanceTransactions();

      if (result.success && result.data) {
        const transactionData = Array.isArray(result.data) ? result.data : [];
        console.log('Transaction data with relations:', transactionData);
        setTransactions(transactionData);
        calculateStatistics(transactionData);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStatistics = (transactionsList) => {
    const stats = transactionsList.reduce((acc, transaction) => {
      acc.totalTransactions++;
      acc.totalAmount += transaction.amount || 0;

      if (transaction.status === 'completed') acc.completedCount++;
      else if (transaction.status === 'pending') acc.pendingCount++;
      else if (transaction.status === 'failed') acc.failedCount++;

      return acc;
    }, {
      totalTransactions: 0,
      totalAmount: 0,
      completedCount: 0,
      pendingCount: 0,
      failedCount: 0
    });

    setStats(stats);
  };

  const applyFilters = () => {
    let filtered = [...transactions];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(transaction => {
        const searchLower = searchQuery.toLowerCase();
        return (
          transaction.transactionNumber?.toLowerCase().includes(searchLower) ||
          transaction.receiptNumber?.toLowerCase().includes(searchLower) ||
          transaction.referenceNumber?.toLowerCase().includes(searchLower) ||
          transaction.payerName?.toLowerCase().includes(searchLower) ||
          transaction.payerContact?.toLowerCase().includes(searchLower)
        );
      });
    }

    // Date filter
    if (filters.startDate) {
      filtered = filtered.filter(transaction =>
        new Date(transaction.transactionDate) >= new Date(filters.startDate)
      );
    }
    if (filters.endDate) {
      filtered = filtered.filter(transaction =>
        new Date(transaction.transactionDate) <= new Date(filters.endDate)
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(transaction => transaction.status === filters.status);
    }

    // Type filter
    if (filters.type !== 'all') {
      filtered = filtered.filter(transaction => transaction.transactionType === filters.type);
    }

    // Payment method filter
    if (filters.paymentMethod !== 'all') {
      filtered = filtered.filter(transaction => transaction.paymentMethod === filters.paymentMethod);
    }

    // Amount filter
    if (filters.minAmount) {
      filtered = filtered.filter(transaction => transaction.amount >= parseFloat(filters.minAmount));
    }
    if (filters.maxAmount) {
      filtered = filtered.filter(transaction => transaction.amount <= parseFloat(filters.maxAmount));
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a[sortConfig.key] || '';
      const bValue = b[sortConfig.key] || '';

      if (sortConfig.key === 'amount') {
        return sortConfig.direction === 'asc'
          ? parseFloat(aValue) - parseFloat(bValue)
          : parseFloat(bValue) - parseFloat(aValue);
      }

      if (sortConfig.key === 'transactionDate') {
        return sortConfig.direction === 'asc'
          ? new Date(aValue) - new Date(bValue)
          : new Date(bValue) - new Date(aValue);
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredTransactions(filtered);
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleViewDetails = async (transaction) => {
    setSelectedTransaction(transaction);
    setShowDetailsModal(true);
  };

  const handlePrint = (transaction) => {
    // Create a print window with transaction details
    const printWindow = window.open('', '_blank');
    const receiptHTML = generateReceiptHTML(transaction);
    printWindow.document.write(receiptHTML);
    printWindow.document.close();
    printWindow.print();
  };

  const generateReceiptHTML = (transaction) => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Transaction Receipt</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .receipt-details { margin-bottom: 20px; }
            .detail-row { display: flex; justify-content: space-between; margin: 10px 0; }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>School Name</h2>
            <h3>Transaction Receipt</h3>
          </div>
          <div class="receipt-details">
            <div class="detail-row">
              <span>Receipt Number:</span>
              <span>${transaction.receiptNumber || 'N/A'}</span>
            </div>
            <div class="detail-row">
              <span>Transaction Number:</span>
              <span>${transaction.transactionNumber}</span>
            </div>
            <div class="detail-row">
              <span>Date:</span>
              <span>${new Date(transaction.transactionDate).toLocaleDateString()}</span>
            </div>
            <div class="detail-row">
              <span>Amount:</span>
              <span>₹${transaction.amount}</span>
            </div>
            <div class="detail-row">
              <span>Payment Method:</span>
              <span>${transaction.paymentMethod}</span>
            </div>
            <div class="detail-row">
              <span>Status:</span>
              <span>${transaction.status}</span>
            </div>
          </div>
          <div class="footer">
            <p>Thank you for your payment</p>
          </div>
        </body>
      </html>
    `;
  };

  const handleExport = () => {
    const csv = convertToCSV(filteredTransactions);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const convertToCSV = (data) => {
    const headers = ['Transaction Number', 'Date', 'Type', 'Category', 'Amount', 'Payment Method', 'Status', 'Payer Name', 'Reference Number'];
    const rows = data.map(t => [
      t.transactionNumber,
      new Date(t.transactionDate).toLocaleDateString(),
      t.transactionType,
      t.transactionCategory,
      t.amount,
      t.paymentMethod,
      t.status,
      t.payerName || '',
      t.referenceNumber || ''
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const resetFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      status: 'all',
      type: 'all',
      paymentMethod: 'all',
      minAmount: '',
      maxAmount: ''
    });
    setSearchQuery('');
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

  const getStatusBadge = (status) => {
    const badges = {
      completed: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
      failed: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle }
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

  const getPaymentMethodIcon = (method) => {
    const icons = {
      cash: DollarSign,
      card: CreditCard,
      upi: CreditCard,
      bank_transfer: FileText,
      cheque: FileText
    };
    const Icon = icons[method] || DollarSign;
    return <Icon className="w-4 h-4" />;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
            <p className="text-sm text-gray-600 mt-1">Manage and track all financial transactions</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchTransactions}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              disabled={filteredTransactions.length === 0}
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Transactions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalTransactions}</p>
              </div>
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">Total Amount</p>
                <p className="text-2xl font-bold text-blue-900">₹{stats.totalAmount.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">Completed</p>
                <p className="text-2xl font-bold text-green-900">{stats.completedCount}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </div>

          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-900">{stats.pendingCount}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-400" />
            </div>
          </div>

          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600">Failed</p>
                <p className="text-2xl font-bold text-red-900">{stats.failedCount}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </h2>
          <button
            onClick={resetFilters}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Reset Filters
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by transaction number, receipt, reference, or payer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Date Range */}
          <div>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({...filters, startDate: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Start Date"
            />
          </div>

          <div>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({...filters, endDate: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="End Date"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={filters.type}
              onChange={(e) => setFilters({...filters, type: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>

          {/* Payment Method Filter */}
          <div>
            <select
              value={filters.paymentMethod}
              onChange={(e) => setFilters({...filters, paymentMethod: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Payment Methods</option>
              <option value="cash">Cash</option>
              <option value="cheque">Cheque</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="upi">UPI</option>
              <option value="credit_card">Credit Card</option>
              <option value="debit_card">Debit Card</option>
            </select>
          </div>

          {/* Amount Range */}
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min Amount"
              value={filters.minAmount}
              onChange={(e) => setFilters({...filters, minAmount: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="number"
              placeholder="Max Amount"
              value={filters.maxAmount}
              onChange={(e) => setFilters({...filters, maxAmount: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow-sm">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">
                      <button
                        onClick={() => handleSort('transactionNumber')}
                        className="flex items-center gap-1 font-medium text-gray-700 hover:text-gray-900"
                      >
                        Transaction
                        <ArrowUpDown className="w-4 h-4" />
                      </button>
                    </th>
                    <th className="text-left p-4">
                      <button
                        onClick={() => handleSort('transactionDate')}
                        className="flex items-center gap-1 font-medium text-gray-700 hover:text-gray-900"
                      >
                        Date
                        <ArrowUpDown className="w-4 h-4" />
                      </button>
                    </th>
                    <th className="text-left p-4">Student & Schedule</th>
                    <th className="text-left p-4">Type</th>
                    <th className="text-left p-4">
                      <button
                        onClick={() => handleSort('amount')}
                        className="flex items-center gap-1 font-medium text-gray-700 hover:text-gray-900"
                      >
                        Amount
                        <ArrowUpDown className="w-4 h-4" />
                      </button>
                    </th>
                    <th className="text-left p-4">Payment Method</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {currentItems.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-gray-900">{transaction.transactionNumber}</p>
                          {transaction.receiptNumber && (
                            <p className="text-xs text-gray-500">{transaction.receiptNumber}</p>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1 text-gray-700">
                          <Calendar className="w-4 h-4" />
                          {new Date(transaction.transactionDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          {(() => {
                            const paymentItem = transaction.paymentItems?.[0];
                            const schedule = paymentItem?.payment_schedule;
                            const enrollment = schedule?.enrollment;
                            const student = enrollment?.student;
                            const studentName = student ?
                              `${student.first_name || student.firstName || ''} ${student.last_name || student.lastName || ''}`.trim() : null;

                            return (
                              <>
                                {studentName && student && (
                                  <div className="flex items-center gap-1">
                                    <User className="w-3 h-3 text-gray-400" />
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/students/${student.id}/finance`);
                                      }}
                                      className="text-sm font-medium text-gray-900 hover:text-blue-600 hover:underline"
                                      title="View Student Finance Details"
                                    >
                                      {studentName}
                                    </button>
                                  </div>
                                )}
                                {schedule && (
                                  <div className="flex items-center gap-1">
                                    <Receipt className="w-3 h-3 text-gray-400" />
                                    <button
                                      onClick={() => navigate(`/finance/schedules/${schedule.id}`)}
                                      className="text-xs text-blue-600 hover:text-blue-700 hover:underline"
                                      title="View Payment Schedule"
                                    >
                                      {schedule.schedule_number || `Schedule #${schedule.id}`}
                                    </button>
                                  </div>
                                )}
                                {paymentItem?.fee_definition && (
                                  <div className="flex items-center gap-1">
                                    <BookOpen className="w-3 h-3 text-gray-400" />
                                    <span className="text-xs text-gray-600">
                                      {paymentItem.fee_definition.name}
                                    </span>
                                  </div>
                                )}
                                {!studentName && !schedule && (
                                  <span className="text-sm text-gray-400 italic">No schedule linked</span>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          {transaction.transactionType === 'income' ? (
                            <TrendingUp className="w-4 h-4 text-green-600" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-600" />
                          )}
                          <span className="text-gray-700 capitalize">{transaction.transactionType}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`font-semibold ${
                          transaction.transactionType === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.transactionType === 'income' ? '+' : '-'}₹{transaction.amount?.toLocaleString()}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {getPaymentMethodIcon(transaction.paymentMethod)}
                          <span className="text-gray-700 capitalize">
                            {transaction.paymentMethod?.replace('_', ' ')}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        {getStatusBadge(transaction.status)}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewDetails(transaction)}
                            className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handlePrint(transaction)}
                            className="p-1 text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded"
                            title="Print Receipt"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          {transaction.paymentItems?.[0]?.payment_schedule && (
                            <button
                              onClick={() => navigate(`/finance/schedules/${transaction.paymentItems[0].payment_schedule.id}`)}
                              className="p-1 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded"
                              title="View Schedule"
                            >
                              <Link className="w-4 h-4" />
                            </button>
                          )}
                          {(() => {
                            const paymentItem = transaction.paymentItems?.[0];
                            const schedule = paymentItem?.payment_schedule;
                            const enrollment = schedule?.enrollment;
                            const student = enrollment?.student;
                            return student ? (
                              <button
                                onClick={() => navigate(`/students/${student.id}/finance`)}
                                className="p-1 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded"
                                title="View Student Finance"
                              >
                                <User className="w-4 h-4" />
                              </button>
                            ) : null;
                          })()}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {filteredTransactions.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
                <p className="text-gray-600">Try adjusting your filters or search criteria</p>
              </div>
            )}

            {/* Pagination */}
            {filteredTransactions.length > 0 && (
              <div className="flex items-center justify-between p-4 border-t">
                <div className="text-sm text-gray-700">
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredTransactions.length)} of {filteredTransactions.length} transactions
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {[...Array(Math.min(5, totalPages))].map((_, index) => {
                    const pageNumber = index + 1;
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => setCurrentPage(pageNumber)}
                        className={`px-3 py-1 rounded-lg ${
                          currentPage === pageNumber
                            ? 'bg-blue-600 text-white'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}

                  {totalPages > 5 && <span className="px-2">...</span>}

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Transaction Details Modal */}
      {showDetailsModal && selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Transaction Details</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Transaction Basic Info */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 border-b pb-2">Transaction Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">Transaction Number</label>
                    <p className="font-medium">{selectedTransaction.transactionNumber}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Receipt Number</label>
                    <p className="font-medium">{selectedTransaction.receiptNumber || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Date</label>
                    <p className="font-medium">{new Date(selectedTransaction.transactionDate).toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Status</label>
                    <div className="mt-1">{getStatusBadge(selectedTransaction.status)}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Type</label>
                    <p className="font-medium capitalize">{selectedTransaction.transactionType}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Category</label>
                    <p className="font-medium capitalize">{selectedTransaction.transactionCategory?.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Amount</label>
                    <p className="font-medium text-lg">₹{selectedTransaction.amount?.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Payment Method</label>
                    <p className="font-medium capitalize">{selectedTransaction.paymentMethod?.replace('_', ' ')}</p>
                  </div>
                  {selectedTransaction.referenceNumber && (
                    <div>
                      <label className="text-sm text-gray-600">Reference Number</label>
                      <p className="font-medium">{selectedTransaction.referenceNumber}</p>
                    </div>
                  )}
                  {selectedTransaction.payerName && (
                    <div>
                      <label className="text-sm text-gray-600">Payer Name</label>
                      <p className="font-medium">{selectedTransaction.payerName}</p>
                    </div>
                  )}
                  {selectedTransaction.payerContact && (
                    <div>
                      <label className="text-sm text-gray-600">Payer Contact</label>
                      <p className="font-medium">{selectedTransaction.payerContact}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Schedule Connection */}
              {(() => {
                const paymentItem = selectedTransaction.paymentItems?.[0];
                const schedule = paymentItem?.payment_schedule;
                const enrollment = schedule?.enrollment;
                const student = enrollment?.student;

                if (schedule || student) {
                  return (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-3 border-b pb-2">Connected Payment Schedule</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {student && (
                          <>
                            <div>
                              <label className="text-sm text-gray-600">Student Name</label>
                              <p className="font-medium">
                                {`${student.first_name || student.firstName || ''} ${student.last_name || student.lastName || ''}`.trim()}
                              </p>
                            </div>
                            <div>
                              <label className="text-sm text-gray-600">GR Number</label>
                              <p className="font-medium">{student.gr_number || student.registrationNumber || '-'}</p>
                            </div>
                          </>
                        )}
                        {schedule && (
                          <>
                            <div>
                              <label className="text-sm text-gray-600">Schedule Number</label>
                              <button
                                onClick={() => {
                                  navigate(`/finance/schedules/${schedule.id}`);
                                  setShowDetailsModal(false);
                                }}
                                className="font-medium text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
                              >
                                {schedule.schedule_number || `Schedule #${schedule.id}`}
                                <Link className="w-3 h-3" />
                              </button>
                            </div>
                            <div>
                              <label className="text-sm text-gray-600">Schedule Status</label>
                              <p className="font-medium capitalize">{schedule.status || '-'}</p>
                            </div>
                          </>
                        )}
                        {enrollment?.class && (
                          <div>
                            <label className="text-sm text-gray-600">Class</label>
                            <p className="font-medium">{enrollment.class.name || '-'}</p>
                          </div>
                        )}
                        {enrollment?.academic_year && (
                          <div>
                            <label className="text-sm text-gray-600">Academic Year</label>
                            <p className="font-medium">{enrollment.academic_year.name || '-'}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              {/* Payment Items */}
              {selectedTransaction.paymentItems && selectedTransaction.paymentItems.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 border-b pb-2">Payment Items</h3>
                  <div className="space-y-2">
                    {selectedTransaction.paymentItems.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">
                            {item.fee_definition?.name || item.description || `Item ${index + 1}`}
                          </p>
                          {item.fee_definition?.type && (
                            <p className="text-xs text-gray-600">Type: {item.fee_definition.type.name}</p>
                          )}
                        </div>
                        <p className="font-semibold text-gray-900">₹{item.amount?.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedTransaction.notes && (
                <div>
                  <label className="text-sm text-gray-600">Notes</label>
                  <p className="font-medium mt-1">{selectedTransaction.notes}</p>
                </div>
              )}
            </div>

            <div className="p-6 border-t flex justify-end gap-2">
              <button
                onClick={() => handlePrint(selectedTransaction)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Print Receipt
              </button>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;