import React, { useState } from 'react';
import {
  Search,
  Filter,
  CreditCard,
  Banknote,
  Smartphone,
  QrCode,
  CheckCircle,
  AlertCircle,
  Clock,
  DollarSign,
  User,
  GraduationCap,
  Calendar,
  Receipt,
  Download,
  Printer,
  Send,
  Plus,
  X,
  Info,
  Building,
  MapPin
} from 'lucide-react';

const PaymentProcessing = () => {
  const [activeTab, setActiveTab] = useState('process');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedFees, setSelectedFees] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('online');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data for prototype
  const students = [
    {
      id: 1,
      name: 'Arjun Sharma',
      grNo: 'GR2024001',
      class: '10-A',
      guardianName: 'Rajesh Sharma',
      mobile: '+91 98765 43210',
      pendingFees: [
        { type: 'Annual Fee', amount: 15000, dueDate: '2024-03-31', status: 'pending', mandatory: true },
        { type: 'Transport Fee', amount: 8500, dueDate: '2024-02-15', status: 'overdue', mandatory: false },
        { type: 'Exam Fee', amount: 3500, dueDate: '2024-04-10', status: 'pending', mandatory: true }
      ],
      totalPending: 27000,
      lastPayment: '2024-01-10'
    },
    {
      id: 2,
      name: 'Priya Patel',
      grNo: 'GR2024002',
      class: '11-B',
      guardianName: 'Amit Patel',
      mobile: '+91 87654 32109',
      pendingFees: [
        { type: 'Annual Fee', amount: 18000, dueDate: '2024-03-31', status: 'pending', mandatory: true },
        { type: 'Lab Fee', amount: 3500, dueDate: '2024-03-31', status: 'pending', mandatory: true }
      ],
      totalPending: 21500,
      lastPayment: '2024-01-15'
    },
    {
      id: 3,
      name: 'Rohit Kumar',
      grNo: 'GR2024003',
      class: '12-A',
      guardianName: 'Suresh Kumar',
      mobile: '+91 76543 21098',
      pendingFees: [
        { type: 'Annual Fee', amount: 20000, dueDate: '2024-03-31', status: 'pending', mandatory: true },
        { type: 'Transport Fee', amount: 8500, dueDate: '2024-02-15', status: 'overdue', mandatory: false },
        { type: 'Exam Fee', amount: 5000, dueDate: '2024-04-10', status: 'pending', mandatory: true },
        { type: 'Sports Fee', amount: 1500, dueDate: '2024-04-30', status: 'pending', mandatory: false }
      ],
      totalPending: 35000,
      lastPayment: '2023-12-20'
    }
  ];

  const recentTransactions = [
    {
      id: 1,
      studentName: 'Anisha Singh',
      grNo: 'GR2024004',
      amount: 15000,
      type: 'Annual Fee',
      method: 'UPI',
      status: 'completed',
      transactionId: 'TXN123456789',
      date: '2024-01-16',
      time: '14:30'
    },
    {
      id: 2,
      studentName: 'Vikram Joshi',
      grNo: 'GR2024005',
      amount: 8500,
      type: 'Transport Fee',
      method: 'Card',
      status: 'completed',
      transactionId: 'TXN123456790',
      date: '2024-01-16',
      time: '13:45'
    },
    {
      id: 3,
      studentName: 'Kavya Reddy',
      grNo: 'GR2024006',
      amount: 3500,
      type: 'Exam Fee',
      method: 'Cash',
      status: 'completed',
      transactionId: 'CASH001234',
      date: '2024-01-16',
      time: '12:15'
    }
  ];

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.grNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.class.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const StudentCard = ({ student, onSelect }) => {
    const overdueCount = student.pendingFees.filter(fee => fee.status === 'overdue').length;
    const mandatoryAmount = student.pendingFees.filter(fee => fee.mandatory).reduce((sum, fee) => sum + fee.amount, 0);

    return (
      <div
        className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 cursor-pointer"
        onClick={() => onSelect(student)}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="font-bold text-indigo-600 text-lg">
                  {student.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">{student.name}</h3>
                <p className="text-sm text-gray-600">{student.grNo} • {student.class}</p>
              </div>
            </div>
            {overdueCount > 0 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                <AlertCircle className="w-3 h-3 mr-1" />
                {overdueCount} Overdue
              </span>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Total Pending</span>
              <span className="font-bold text-red-600">₹{student.totalPending.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Mandatory Fees</span>
              <span className="font-bold text-orange-600">₹{mandatoryAmount.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Pending Items</span>
              <span className="font-bold text-blue-600">{student.pendingFees.length} fees</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Guardian: {student.guardianName}</span>
              <span className="text-gray-600">Last Payment: {student.lastPayment}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const PaymentModal = ({ student, onClose }) => {
    const [selectedMethod, setSelectedMethod] = useState('online');
    const [processing, setProcessing] = useState(false);
    const [completed, setCompleted] = useState(false);

    const totalSelected = selectedFees.reduce((sum, feeId) => {
      const fee = student.pendingFees.find(f => f.type === feeId);
      return sum + (fee ? fee.amount : 0);
    }, 0);

    const handlePayment = () => {
      setProcessing(true);
      setTimeout(() => {
        setProcessing(false);
        setCompleted(true);
        setTimeout(() => {
          setCompleted(false);
          onClose();
        }, 2000);
      }, 3000);
    };

    if (completed) {
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h3>
            <p className="text-gray-600 mb-4">
              Payment of ₹{totalSelected.toLocaleString()} has been processed successfully.
            </p>
            <p className="text-sm text-gray-500">Transaction ID: TXN{Date.now()}</p>
          </div>
        </div>
      );
    }

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Process Payment</h3>
                <p className="text-sm text-gray-600">{student.name} • {student.grNo}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Fee Selection */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-3">Select Fees to Pay</h4>
            <div className="space-y-3">
              {student.pendingFees.map((fee) => (
                <div key={fee.type} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id={fee.type}
                      checked={selectedFees.includes(fee.type)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedFees([...selectedFees, fee.type]);
                        } else {
                          setSelectedFees(selectedFees.filter(f => f !== fee.type));
                        }
                      }}
                      className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <div>
                      <label htmlFor={fee.type} className="font-medium text-gray-900 cursor-pointer">
                        {fee.type}
                      </label>
                      <p className="text-sm text-gray-600">Due: {fee.dueDate}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">₹{fee.amount.toLocaleString()}</p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      fee.status === 'overdue' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {fee.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Method Selection */}
          {selectedFees.length > 0 && (
            <>
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Payment Method</h4>
                <div className="grid grid-cols-4 gap-3">
                  <button
                    onClick={() => setSelectedMethod('online')}
                    className={`p-4 border-2 rounded-xl transition-colors ${
                      selectedMethod === 'online'
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <CreditCard className="h-6 w-6 mx-auto mb-2" />
                    <span className="text-sm font-medium">Online</span>
                  </button>
                  <button
                    onClick={() => setSelectedMethod('upi')}
                    className={`p-4 border-2 rounded-xl transition-colors ${
                      selectedMethod === 'upi'
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Smartphone className="h-6 w-6 mx-auto mb-2" />
                    <span className="text-sm font-medium">UPI</span>
                  </button>
                  <button
                    onClick={() => setSelectedMethod('cash')}
                    className={`p-4 border-2 rounded-xl transition-colors ${
                      selectedMethod === 'cash'
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Banknote className="h-6 w-6 mx-auto mb-2" />
                    <span className="text-sm font-medium">Cash</span>
                  </button>
                  <button
                    onClick={() => setSelectedMethod('qr')}
                    className={`p-4 border-2 rounded-xl transition-colors ${
                      selectedMethod === 'qr'
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <QrCode className="h-6 w-6 mx-auto mb-2" />
                    <span className="text-sm font-medium">QR Pay</span>
                  </button>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Payment Summary</h4>
                <div className="space-y-2">
                  {selectedFees.map(feeType => {
                    const fee = student.pendingFees.find(f => f.type === feeType);
                    return (
                      <div key={feeType} className="flex justify-between text-sm">
                        <span className="text-gray-600">{feeType}</span>
                        <span className="font-medium">₹{fee.amount.toLocaleString()}</span>
                      </div>
                    );
                  })}
                  <div className="border-t border-gray-300 pt-2 mt-2">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total Amount</span>
                      <span className="text-indigo-600">₹{totalSelected.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePayment}
                  disabled={processing}
                  className="flex-1 py-3 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Processing...</span>
                    </div>
                  ) : (
                    `Pay ₹${totalSelected.toLocaleString()}`
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Payment Processing</h1>
            <p className="text-gray-600 mt-1">Process fee payments and manage transactions</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('process')}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-lg transition-colors ${
              activeTab === 'process'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-600 hover:text-indigo-600'
            }`}
          >
            <CreditCard className="h-4 w-4" />
            <span className="font-medium">Process Payments</span>
          </button>
          <button
            onClick={() => setActiveTab('recent')}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-lg transition-colors ${
              activeTab === 'recent'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-600 hover:text-indigo-600'
            }`}
          >
            <Receipt className="h-4 w-4" />
            <span className="font-medium">Recent Transactions</span>
          </button>
        </div>

        {activeTab === 'process' && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by student name, GR number, or class..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <button className="flex items-center space-x-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Filter className="h-4 w-4" />
                  <span>Filters</span>
                </button>
              </div>
            </div>

            {/* Students with Pending Payments */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredStudents.map((student) => (
                <StudentCard
                  key={student.id}
                  student={student}
                  onSelect={(student) => {
                    setSelectedStudent(student);
                    setShowPaymentModal(true);
                    setSelectedFees([]);
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'recent' && (
          <div className="space-y-6">
            {/* Transaction Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Today's Collections</p>
                    <p className="text-2xl font-bold text-gray-900">₹87,500</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Receipt className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Transactions</p>
                    <p className="text-2xl font-bold text-gray-900">24</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <CreditCard className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Online Payments</p>
                    <p className="text-2xl font-bold text-gray-900">18</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Banknote className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Cash Payments</p>
                    <p className="text-2xl font-bold text-gray-900">6</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <Receipt className="h-5 w-5 text-indigo-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                      <Download className="h-4 w-4" />
                      <span className="text-sm">Export</span>
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{transaction.studentName}</p>
                          <p className="text-sm text-gray-500">{transaction.grNo} • {transaction.type}</p>
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-gray-900">₹{transaction.amount.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">{transaction.method}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-900">{transaction.date}</p>
                        <p className="text-sm text-gray-500">{transaction.time}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                          <Download className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                          <Printer className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Modal */}
        {showPaymentModal && selectedStudent && (
          <PaymentModal
            student={selectedStudent}
            onClose={() => {
              setShowPaymentModal(false);
              setSelectedStudent(null);
              setSelectedFees([]);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default PaymentProcessing;