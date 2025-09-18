import React, { useState } from 'react';
import {
  Search,
  Filter,
  Download,
  Printer,
  Calendar,
  Eye,
  Receipt,
  CheckCircle,
  AlertCircle,
  Clock,
  DollarSign,
  CreditCard,
  Banknote,
  Smartphone,
  QrCode,
  User,
  GraduationCap,
  FileText,
  TrendingUp,
  BarChart3,
  PieChart,
  RefreshCw,
  Send,
  Mail,
  Phone
} from 'lucide-react';

const PaymentHistory = () => {
  const [activeTab, setActiveTab] = useState('history');
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  // Mock data for prototype
  const paymentHistory = [
    {
      id: 1,
      transactionId: 'TXN123456789',
      studentName: 'Arjun Sharma',
      grNo: 'GR2024001',
      class: '10-A',
      feeType: 'Annual Fee',
      amount: 15000,
      method: 'UPI',
      status: 'completed',
      date: '2024-01-16',
      time: '14:30',
      receiptNo: 'RCP001234',
      guardianName: 'Rajesh Sharma',
      mobile: '+91 98765 43210'
    },
    {
      id: 2,
      transactionId: 'TXN123456790',
      studentName: 'Priya Patel',
      grNo: 'GR2024002',
      class: '11-B',
      feeType: 'Transport Fee',
      amount: 8500,
      method: 'Card',
      status: 'completed',
      date: '2024-01-15',
      time: '13:45',
      receiptNo: 'RCP001235',
      guardianName: 'Amit Patel',
      mobile: '+91 87654 32109'
    },
    {
      id: 3,
      transactionId: 'TXN123456791',
      studentName: 'Rohit Kumar',
      grNo: 'GR2024003',
      class: '12-A',
      feeType: 'Exam Fee',
      amount: 5000,
      method: 'Cash',
      status: 'completed',
      date: '2024-01-14',
      time: '12:15',
      receiptNo: 'RCP001236',
      guardianName: 'Suresh Kumar',
      mobile: '+91 76543 21098'
    },
    {
      id: 4,
      transactionId: 'TXN123456792',
      studentName: 'Anisha Singh',
      grNo: 'GR2024004',
      class: '9-A',
      feeType: 'Lab Fee',
      amount: 2500,
      method: 'Online',
      status: 'failed',
      date: '2024-01-13',
      time: '11:30',
      receiptNo: '-',
      guardianName: 'Vikash Singh',
      mobile: '+91 65432 10987'
    },
    {
      id: 5,
      transactionId: 'TXN123456793',
      studentName: 'Kavya Reddy',
      grNo: 'GR2024005',
      class: '10-B',
      feeType: 'Sports Fee',
      amount: 1500,
      method: 'QR Pay',
      status: 'pending',
      date: '2024-01-13',
      time: '10:45',
      receiptNo: '-',
      guardianName: 'Ramesh Reddy',
      mobile: '+91 54321 09876'
    }
  ];

  const monthlyStats = {
    totalCollected: 450000,
    totalTransactions: 156,
    successfulPayments: 142,
    failedPayments: 14,
    averageAmount: 2885,
    topPaymentMethod: 'UPI'
  };

  const chartData = [
    { method: 'UPI', amount: 180000, count: 62, color: 'indigo' },
    { method: 'Card', amount: 135000, count: 45, color: 'green' },
    { method: 'Cash', amount: 90000, count: 30, color: 'orange' },
    { method: 'QR Pay', amount: 45000, count: 19, color: 'purple' }
  ];

  const filteredHistory = paymentHistory.filter(payment => {
    const matchesSearch = payment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.grNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || payment.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMethodIcon = (method) => {
    switch (method.toLowerCase()) {
      case 'upi':
        return <Smartphone className="h-4 w-4" />;
      case 'card':
        return <CreditCard className="h-4 w-4" />;
      case 'cash':
        return <Banknote className="h-4 w-4" />;
      case 'qr pay':
        return <QrCode className="h-4 w-4" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  const ReceiptModal = ({ transaction, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Receipt className="h-8 w-8 text-indigo-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Payment Receipt</h3>
          <p className="text-sm text-gray-600">{transaction.receiptNo}</p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="border-b border-gray-200 pb-4">
            <h4 className="font-semibold text-gray-900 mb-2">School Information</h4>
            <p className="text-sm text-gray-600">Gurukul School</p>
            <p className="text-sm text-gray-600">123 Education Street, City</p>
            <p className="text-sm text-gray-600">Phone: +91 12345 67890</p>
          </div>

          <div className="border-b border-gray-200 pb-4">
            <h4 className="font-semibold text-gray-900 mb-2">Student Details</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-gray-600">Name:</span>
              <span className="font-medium">{transaction.studentName}</span>
              <span className="text-gray-600">GR No:</span>
              <span className="font-medium">{transaction.grNo}</span>
              <span className="text-gray-600">Class:</span>
              <span className="font-medium">{transaction.class}</span>
              <span className="text-gray-600">Guardian:</span>
              <span className="font-medium">{transaction.guardianName}</span>
            </div>
          </div>

          <div className="border-b border-gray-200 pb-4">
            <h4 className="font-semibold text-gray-900 mb-2">Payment Details</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-gray-600">Fee Type:</span>
              <span className="font-medium">{transaction.feeType}</span>
              <span className="text-gray-600">Amount:</span>
              <span className="font-medium">₹{transaction.amount.toLocaleString()}</span>
              <span className="text-gray-600">Method:</span>
              <span className="font-medium">{transaction.method}</span>
              <span className="text-gray-600">Date:</span>
              <span className="font-medium">{transaction.date} {transaction.time}</span>
              <span className="text-gray-600">Transaction ID:</span>
              <span className="font-medium text-xs">{transaction.transactionId}</span>
            </div>
          </div>

          <div className="text-center">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(transaction.status)}`}>
              {getStatusIcon(transaction.status)}
              <span className="ml-1 capitalize">{transaction.status}</span>
            </span>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          <button className="flex items-center space-x-2 py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            <Download className="h-4 w-4" />
            <span>Download</span>
          </button>
          <button className="flex items-center space-x-2 py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <Printer className="h-4 w-4" />
            <span>Print</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Payment History & Reports</h1>
            <p className="text-gray-600 mt-1">View payment history, generate reports, and analyze trends</p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
            <button className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
              <Download className="h-4 w-4" />
              <span>Export Report</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-lg transition-colors ${
              activeTab === 'history'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-600 hover:text-indigo-600'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span className="font-medium">Payment History</span>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-lg transition-colors ${
              activeTab === 'analytics'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-600 hover:text-indigo-600'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <span className="font-medium">Analytics</span>
          </button>
        </div>

        {activeTab === 'history' && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by student name, GR number, or transaction ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
                <button className="flex items-center space-x-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Filter className="h-4 w-4" />
                  <span>More Filters</span>
                </button>
              </div>
            </div>

            {/* Payment History Table */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <FileText className="h-5 w-5 text-indigo-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Payment History</h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{filteredHistory.length} transactions</span>
                    <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                      <RefreshCw className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fee Details</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredHistory.map((payment) => (
                      <tr key={payment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                              <span className="font-bold text-indigo-600 text-sm">
                                {payment.studentName.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">{payment.studentName}</div>
                              <div className="text-sm text-gray-500">{payment.grNo} • {payment.class}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{payment.feeType}</div>
                          <div className="text-sm text-gray-500">{payment.transactionId}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-gray-900">₹{payment.amount.toLocaleString()}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {getMethodIcon(payment.method)}
                            <span className="text-sm text-gray-900">{payment.method}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                            {getStatusIcon(payment.status)}
                            <span className="ml-1 capitalize">{payment.status}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>{payment.date}</div>
                          <div className="text-gray-500">{payment.time}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                setSelectedTransaction(payment);
                                setShowReceiptModal(true);
                              }}
                              className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            {payment.status === 'completed' && (
                              <>
                                <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                                  <Download className="h-4 w-4" />
                                </button>
                                <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                  <Send className="h-4 w-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Collected</p>
                    <p className="text-2xl font-bold text-gray-900">₹{monthlyStats.totalCollected.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Receipt className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                    <p className="text-2xl font-bold text-gray-900">{monthlyStats.totalTransactions}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Success Rate</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {Math.round((monthlyStats.successfulPayments / monthlyStats.totalTransactions) * 100)}%
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg. Payment</p>
                    <p className="text-2xl font-bold text-gray-900">₹{monthlyStats.averageAmount.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Methods Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <PieChart className="h-5 w-5 text-indigo-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Payment Methods</h3>
                  </div>
                </div>
                <div className="space-y-4">
                  {chartData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 bg-${item.color}-500 rounded-full`}></div>
                        <span className="font-medium text-gray-900">{item.method}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">₹{(item.amount / 1000).toFixed(0)}K</p>
                        <p className="text-sm text-gray-500">{item.count} transactions</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <BarChart3 className="h-5 w-5 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Monthly Trends</h3>
                  </div>
                </div>
                <div className="space-y-4">
                  {[
                    { month: 'January', amount: 450000, growth: 12 },
                    { month: 'December', amount: 398000, growth: -5 },
                    { month: 'November', amount: 421000, growth: 8 },
                    { month: 'October', amount: 389000, growth: 3 }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-900">{item.month}</span>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">₹{(item.amount / 1000).toFixed(0)}K</p>
                        <span className={`text-sm ${item.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {item.growth > 0 ? '+' : ''}{item.growth}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Receipt Modal */}
        {showReceiptModal && selectedTransaction && (
          <ReceiptModal
            transaction={selectedTransaction}
            onClose={() => {
              setShowReceiptModal(false);
              setSelectedTransaction(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default PaymentHistory;