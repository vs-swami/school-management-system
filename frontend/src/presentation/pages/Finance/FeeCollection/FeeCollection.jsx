import React, { useState, useEffect } from 'react';
import {
  Search,
  CreditCard,
  Wallet,
  Building,
  QrCode,
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle,
  User,
  School,
  Calendar,
  ChevronDown,
  ChevronUp,
  Printer,
  Mail,
  MessageSquare,
  Download,
  Receipt,
  X
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../../../components/common/Button';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import Modal from '../../../components/common/Modal';
import {
  useStudentService,
  usePaymentScheduleService,
  useTransactionService,
  useEnrollmentService
} from '../../../../application/hooks/useServices';

const PaymentMethodIcon = ({ method }) => {
  switch(method) {
    case 'cash': return <DollarSign className="w-5 h-5" />;
    case 'card': return <CreditCard className="w-5 h-5" />;
    case 'bank_transfer': return <Building className="w-5 h-5" />;
    case 'upi': return <QrCode className="w-5 h-5" />;
    default: return <Wallet className="w-5 h-5" />;
  }
};

const FeeCollection = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const studentService = useStudentService();
  const paymentScheduleService = usePaymentScheduleService();
  const transactionService = useTransactionService();

  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [students, setStudents] = useState([]);
  const [paymentSchedule, setPaymentSchedule] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentDetails, setPaymentDetails] = useState({
    referenceNumber: '',
    remarks: ''
  });
  const [processing, setProcessing] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [loading, setLoading] = useState(false);
  const [expandedSchedule, setExpandedSchedule] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [recentCollections, setRecentCollections] = useState([]);
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const [filteredStudents, setFilteredStudents] = useState([]);

  useEffect(() => {
    fetchStudents();
    fetchPendingPayments();
    fetchRecentCollections();

    if (location.state?.payment) {
      handleQuickPayment(location.state.payment);
    }
  }, []);

  useEffect(() => {
    if (searchQuery.length > 2) {
      const filtered = students.filter(student => {
        // Handle both camelCase and snake_case field names
        const firstName = student.firstName || student.first_name || '';
        const middleName = student.middleName || student.middle_name || '';
        const lastName = student.lastName || student.last_name || '';
        const fullName = `${firstName} ${middleName} ${lastName}`.trim().toLowerCase();
        const grNumber = student.registrationNumber || student.gr_number || '';

        return fullName.includes(searchQuery.toLowerCase()) ||
               grNumber?.toLowerCase().includes(searchQuery.toLowerCase());
      });
      setFilteredStudents(filtered);
      setShowStudentDropdown(true);
    } else {
      setFilteredStudents([]);
      setShowStudentDropdown(false);
    }
  }, [searchQuery, students]);

  const fetchStudents = async () => {
    try {
      const result = await studentService.getAllStudents({ limit: 100 });
      if (result.success) {
        setStudents(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchPendingPayments = async () => {
    try {
      const result = await paymentScheduleService.getPendingPayments();
      if (result.success) {
        setPendingPayments(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching pending payments:', error);
    }
  };

  const fetchRecentCollections = async () => {
    try {
      const result = await transactionService.getDailyCollection();
      if (result.success) {
        setRecentCollections(result.data?.transactions || []);
      }
    } catch (error) {
      console.error('Error fetching recent collections:', error);
    }
  };

  const handleQuickPayment = async (payment) => {
    if (payment.studentId) {
      const student = students.find(s => s.id === payment.studentId);
      if (student) {
        handleStudentSelect(student);
      }
    }
  };

  const handleStudentSelect = async (student) => {
    setSelectedStudent(student);
    const firstName = student.firstName || student.first_name || '';
    const middleName = student.middleName || student.middle_name || '';
    const lastName = student.lastName || student.last_name || '';
    const fullName = `${firstName} ${middleName} ${lastName}`.trim();
    setSearchQuery(fullName);
    setShowStudentDropdown(false);
    setCurrentStep(1);
    setLoading(true);

    try {
      const result = await paymentScheduleService.getStudentPaymentSchedule(student.id);
      if (result.success && result.data) {
        setPaymentSchedule(result.data);

        const pendingItems = result.data.paymentItems?.filter(
          item => item.status === 'pending' || item.status === 'partial'
        ) || [];
        setSelectedItems(pendingItems.map(item => item.id));
      }
    } catch (error) {
      console.error('Error fetching payment schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleItemSelect = (itemId) => {
    setSelectedItems(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      }
      return [...prev, itemId];
    });
  };

  const handleSelectAll = () => {
    if (!paymentSchedule?.paymentItems) return;

    const allPendingIds = paymentSchedule.paymentItems
      .filter(item => item.status === 'pending' || item.status === 'partial')
      .map(item => item.id);

    if (selectedItems.length === allPendingIds.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(allPendingIds);
    }
  };

  const calculateTotalAmount = () => {
    if (!paymentSchedule?.paymentItems) return 0;

    return paymentSchedule.paymentItems
      .filter(item => selectedItems.includes(item.id))
      .reduce((total, item) => total + (item.amount - (item.paidAmount || 0)), 0);
  };

  const handleProcessPayment = async () => {
    if (!selectedStudent || selectedItems.length === 0) return;

    setProcessing(true);
    setCurrentStep(2);

    try {
      const paymentData = {
        scheduleId: paymentSchedule.id,
        paymentItemIds: selectedItems,
        amount: calculateTotalAmount(),
        paymentMethod,
        referenceNumber: paymentDetails.referenceNumber,
        remarks: paymentDetails.remarks
      };

      const result = await transactionService.processFeePayment(paymentData);

      if (result.success) {
        setReceipt(result.data);
        setShowReceipt(true);
        setCurrentStep(3);

        setSelectedItems([]);
        setPaymentDetails({ referenceNumber: '', remarks: '' });

        handleStudentSelect(selectedStudent);
        fetchRecentCollections();
        fetchPendingPayments();
      } else {
        alert('Payment Failed: ' + result.error);
      }
    } catch (error) {
      console.error('Error processing payment:', error);
    } finally {
      setProcessing(false);
    }
  };

  const renderStudentSearch = () => (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Student</h2>
      <div className="relative">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or registration number"
            className="w-full px-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
        </div>

        {showStudentDropdown && filteredStudents.length > 0 && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
            {filteredStudents.map(student => {
              const firstName = student.firstName || student.first_name || '';
              const middleName = student.middleName || student.middle_name || '';
              const lastName = student.lastName || student.last_name || '';
              const fullName = `${firstName} ${middleName} ${lastName}`.trim();
              const grNumber = student.registrationNumber || student.gr_number || 'N/A';
              const className = student.currentClass?.className || student.class?.className || 'N/A';

              return (
                <div
                  key={student.id}
                  onClick={() => handleStudentSelect(student)}
                  className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">
                      {firstName[0] || 'S'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {fullName || 'Unknown Student'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {grNumber} | {className}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedStudent && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-blue-600">Student Name</p>
              <p className="text-sm font-semibold text-gray-900">
                {`${selectedStudent.firstName || selectedStudent.first_name || ''} ${selectedStudent.middleName || selectedStudent.middle_name || ''} ${selectedStudent.lastName || selectedStudent.last_name || ''}`.trim() || 'Unknown Student'}
              </p>
            </div>
            <div>
              <p className="text-xs text-blue-600">Registration No.</p>
              <p className="text-sm font-semibold text-gray-900">{selectedStudent.registrationNumber || selectedStudent.gr_number || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-blue-600">Class</p>
              <p className="text-sm font-semibold text-gray-900">
                {selectedStudent.currentClass?.className || selectedStudent.class?.className || 'N/A'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderPaymentSchedule = () => (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Payment Schedule</h2>
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
            Total: ₹{paymentSchedule?.totalAmount?.toLocaleString() || 0}
          </span>
          <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
            Paid: ₹{paymentSchedule?.paidAmount?.toLocaleString() || 0}
          </span>
          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm rounded-full">
            Pending: ₹{paymentSchedule?.pendingAmount?.toLocaleString() || 0}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      ) : paymentSchedule?.paymentItems?.length > 0 ? (
        <>
          <div className="flex justify-between items-center mb-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={
                  selectedItems.length ===
                  paymentSchedule.paymentItems.filter(
                    item => item.status === 'pending' || item.status === 'partial'
                  ).length
                }
                onChange={handleSelectAll}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Select All Pending</span>
            </label>
            <button
              onClick={() => setExpandedSchedule(!expandedSchedule)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              {expandedSchedule ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>

          {expandedSchedule && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fee Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Paid
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Balance
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paymentSchedule.paymentItems.map((item) => {
                    const isPending = item.status === 'pending' || item.status === 'partial';
                    const isOverdue = new Date(item.dueDate) < new Date() && isPending;

                    return (
                      <tr
                        key={item.id}
                        className={`${selectedItems.includes(item.id) ? 'bg-blue-50' : ''} ${isPending ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                        onClick={() => isPending && handleItemSelect(item.id)}
                      >
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(item.id)}
                            disabled={!isPending}
                            onChange={() => {}}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {item.feeType}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">{item.description}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            {isOverdue && (
                              <AlertTriangle className="w-4 h-4 text-red-500" />
                            )}
                            <span className={`text-sm ${isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
                              {new Date(item.dueDate).toLocaleDateString()}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">
                          ₹{(item.amount || 0).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">
                          ₹{(item.paidAmount || 0).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right">
                          ₹{((item.amount || 0) - (item.paidAmount || 0)).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            item.status === 'paid' ? 'bg-green-100 text-green-800' :
                            item.status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                            isOverdue ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {selectedItems.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-700">
                  Selected {selectedItems.length} item(s) for payment
                </p>
                <p className="text-xl font-bold text-gray-900">
                  Total: ₹{calculateTotalAmount().toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No payment schedule found for this student
        </div>
      )}
    </div>
  );

  const renderPaymentMethod = () => (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Method & Details</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {['cash', 'card', 'bank_transfer', 'upi'].map((method) => (
          <button
            key={method}
            onClick={() => setPaymentMethod(method)}
            className={`p-4 rounded-lg border-2 transition-all ${
              paymentMethod === method
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex flex-col items-center gap-2">
              <PaymentMethodIcon method={method} />
              <span className="text-sm capitalize">{method.replace('_', ' ')}</span>
            </div>
          </button>
        ))}
      </div>

      {paymentMethod !== 'cash' && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reference Number
          </label>
          <input
            type="text"
            value={paymentDetails.referenceNumber}
            onChange={(e) => setPaymentDetails(prev => ({
              ...prev,
              referenceNumber: e.target.value
            }))}
            placeholder={
              paymentMethod === 'card' ? 'Transaction ID' :
              paymentMethod === 'bank_transfer' ? 'Transfer Reference' :
              'UPI Transaction ID'
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Remarks (Optional)
        </label>
        <textarea
          value={paymentDetails.remarks}
          onChange={(e) => setPaymentDetails(prev => ({
            ...prev,
            remarks: e.target.value
          }))}
          placeholder="Any additional notes about this payment"
          rows={2}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex gap-3">
        <Button
          variant="primary"
          onClick={handleProcessPayment}
          disabled={processing || selectedItems.length === 0}
          loading={processing}
          className="flex-1"
        >
          <DollarSign className="w-4 h-4 mr-2" />
          {processing ? 'Processing...' : `Collect ₹${calculateTotalAmount().toLocaleString()}`}
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            setSelectedItems([]);
            setPaymentDetails({ referenceNumber: '', remarks: '' });
          }}
        >
          Clear
        </Button>
      </div>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fee Collection</h1>
          <p className="text-sm text-gray-500 mt-1">
            Process student fee payments and manage collections
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate('/finance/transactions')}
          className="flex items-center gap-2"
        >
          <Receipt className="w-4 h-4" />
          View Transactions
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {['New Payment', 'Quick Payments', 'Recent Collections'].map((tab, index) => (
            <button
              key={tab}
              onClick={() => setActiveTab(index)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === index
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {activeTab === 0 && (
        <>
          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-6">
            {['Select Student', 'Choose Fees', 'Payment Details', 'Receipt'].map((step, index) => (
              <div key={step} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  currentStep >= index ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {currentStep > index ? <CheckCircle className="w-5 h-5" /> : index + 1}
                </div>
                {index < 3 && (
                  <div className={`hidden sm:block w-24 h-0.5 ${
                    currentStep > index ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
                <span className="ml-2 text-sm hidden md:inline">{step}</span>
              </div>
            ))}
          </div>

          {renderStudentSearch()}
          {selectedStudent && renderPaymentSchedule()}
          {selectedItems.length > 0 && renderPaymentMethod()}
        </>
      )}

      {activeTab === 1 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Pending Payments</h2>
          <div className="space-y-3">
            {pendingPayments.slice(0, 5).map(payment => (
              <div
                key={payment.id}
                onClick={() => handleQuickPayment(payment)}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                      <School className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{payment.studentName}</p>
                      <p className="text-xs text-gray-500">
                        {payment.feeType} - Due: {new Date(payment.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">
                      ₹{(payment.amount || 0).toLocaleString()}
                    </p>
                    {payment.isOverdue && (
                      <span className="text-xs text-red-600">Overdue</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 2 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Collections</h2>
          <div className="space-y-3">
            {recentCollections.slice(0, 5).map(collection => (
              <div
                key={collection.id}
                className="p-4 border border-gray-200 rounded-lg"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{collection.description}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(collection.transactionDate).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-green-600">
                    ₹{(collection.amount || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceipt && receipt && (
        <Modal
          isOpen={showReceipt}
          onClose={() => setShowReceipt(false)}
          title="Payment Receipt"
        >
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <p className="text-sm font-medium text-green-800">
                  Payment processed successfully!
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-500">Receipt No.</p>
              <p className="text-lg font-semibold">{receipt.receiptNumber}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Student</p>
                <p className="text-sm font-medium">
                  {selectedStudent?.firstName} {selectedStudent?.lastName}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Date</p>
                <p className="text-sm font-medium">
                  {new Date(receipt.transactionDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Amount</p>
                <p className="text-lg font-bold text-blue-600">
                  ₹{(receipt.amount || 0).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Payment Method</p>
                <p className="text-sm font-medium capitalize">
                  {receipt.paymentMethod.replace('_', ' ')}
                </p>
              </div>
            </div>

            {receipt.referenceNumber && (
              <div>
                <p className="text-xs text-gray-500">Reference</p>
                <p className="text-sm font-medium">{receipt.referenceNumber}</p>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button variant="outline" size="sm" className="flex-1">
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                <Mail className="w-4 h-4 mr-2" />
                Email
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                <MessageSquare className="w-4 h-4 mr-2" />
                WhatsApp
              </Button>
            </div>

            <Button
              variant="primary"
              onClick={() => {
                setShowReceipt(false);
                setCurrentStep(0);
                setSelectedStudent(null);
                setPaymentSchedule(null);
                setSearchQuery('');
              }}
              className="w-full"
            >
              New Payment
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default FeeCollection;