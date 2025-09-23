import React, { useState } from 'react';
import {
  X,
  User,
  DollarSign,
  CreditCard,
  Building,
  QrCode,
  Wallet,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Printer,
  Mail,
  MessageSquare,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { useTransactionService } from '../../../application/hooks/useServices';

const PaymentProcessingModal = ({ isOpen, onClose, selectedItems, onSuccess }) => {
  const transactionService = useTransactionService();

  const [currentStep, setCurrentStep] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const [paymentData, setPaymentData] = useState({
    method: 'cash',
    amount: 0,
    referenceNumber: '',
    notes: '',
    splitPayments: []
  });

  const [receipt, setReceipt] = useState(null);

  // Group items by student
  const groupedItems = React.useMemo(() => {
    const groups = {};

    selectedItems.forEach(item => {
      const studentId = item.payment_schedule?.enrollment?.student?.id || 'unknown';
      const studentName = item.payment_schedule?.enrollment?.student ?
        `${item.payment_schedule.enrollment.student.first_name} ${item.payment_schedule.enrollment.student.middle_name || ''} ${item.payment_schedule.enrollment.student.last_name}`.trim() :
        'Unknown Student';

      if (!groups[studentId]) {
        groups[studentId] = {
          studentId,
          studentName,
          student: item.payment_schedule?.enrollment?.student,
          enrollment: item.payment_schedule?.enrollment,
          items: [],
          totalAmount: 0
        };
      }

      groups[studentId].items.push(item);
      groups[studentId].totalAmount += item.net_amount || 0;
    });

    return Object.values(groups);
  }, [selectedItems]);

  const totalAmount = React.useMemo(() => {
    return selectedItems.reduce((sum, item) => sum + (item.net_amount || 0), 0);
  }, [selectedItems]);

  React.useEffect(() => {
    setPaymentData(prev => ({
      ...prev,
      amount: totalAmount
    }));
  }, [totalAmount]);

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

  const handlePaymentMethodChange = (method) => {
    setPaymentData(prev => ({
      ...prev,
      method,
      referenceNumber: method === 'cash' ? '' : prev.referenceNumber
    }));
  };

  const handleProcessPayment = async () => {
    setProcessing(true);
    setError(null);

    try {
      // Prepare batch payment data
      const batchPaymentData = {
        itemIds: selectedItems.map(item => item.id),
        paymentMethod: paymentData.method,
        amount: paymentData.amount,
        referenceNumber: paymentData.referenceNumber,
        notes: paymentData.notes,
        paymentDate: new Date().toISOString()
      };

      const result = await transactionService.processBatchPayment(batchPaymentData);

      if (result.success) {
        setReceipt(result.data);
        setCurrentStep(3); // Move to receipt step
        if (onSuccess) {
          onSuccess(result.data);
        }
      } else {
        setError(result.error || 'Failed to process payment');
      }
    } catch (err) {
      setError(err.message || 'Failed to process payment');
    } finally {
      setProcessing(false);
    }
  };

  const renderReviewStep = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Payment Summary</h3>
        <div className="flex justify-between items-center">
          <span className="text-gray-700">Total Items Selected:</span>
          <span className="font-bold text-lg">{selectedItems.length}</span>
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="text-gray-700">Total Amount:</span>
          <span className="font-bold text-xl text-blue-600">{formatAmount(totalAmount)}</span>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Payment Details by Student</h4>
        {groupedItems.map((group) => (
          <div key={group.studentId} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="font-medium text-gray-900">{group.studentName}</p>
                  <p className="text-sm text-gray-500">
                    GR: {group.enrollment?.gr_no} | Class: {group.enrollment?.class?.name || 'N/A'}
                  </p>
                </div>
              </div>
              <p className="font-bold text-lg">{formatAmount(group.totalAmount)}</p>
            </div>

            <div className="space-y-2 pl-7">
              {group.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <div>
                    <p className="text-gray-700">{item.description}</p>
                    <p className="text-xs text-gray-500">Due: {formatDate(item.due_date)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatAmount(item.net_amount)}</p>
                    {item.isOverdue && (
                      <span className="text-xs text-red-600">Overdue</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPaymentMethodStep = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Select Payment Method</h3>

      <div className="grid grid-cols-2 gap-4">
        {[
          { id: 'cash', label: 'Cash', icon: DollarSign },
          { id: 'card', label: 'Card', icon: CreditCard },
          { id: 'bank_transfer', label: 'Bank Transfer', icon: Building },
          { id: 'upi', label: 'UPI', icon: QrCode }
        ].map((method) => (
          <button
            key={method.id}
            onClick={() => handlePaymentMethodChange(method.id)}
            className={`p-4 rounded-lg border-2 transition-all ${
              paymentData.method === method.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <method.icon className="h-8 w-8 mx-auto mb-2 text-gray-600" />
            <p className="text-sm font-medium">{method.label}</p>
          </button>
        ))}
      </div>

      {paymentData.method !== 'cash' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reference Number *
          </label>
          <input
            type="text"
            value={paymentData.referenceNumber}
            onChange={(e) => setPaymentData(prev => ({
              ...prev,
              referenceNumber: e.target.value
            }))}
            placeholder={
              paymentData.method === 'card' ? 'Transaction ID' :
              paymentData.method === 'bank_transfer' ? 'Transfer Reference' :
              'UPI Transaction ID'
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Notes (Optional)
        </label>
        <textarea
          value={paymentData.notes}
          onChange={(e) => setPaymentData(prev => ({
            ...prev,
            notes: e.target.value
          }))}
          placeholder="Any additional notes about this payment"
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-700">Amount to Collect:</span>
          <span className="font-bold text-xl text-green-600">{formatAmount(paymentData.amount)}</span>
        </div>
      </div>
    </div>
  );

  const renderConfirmationStep = () => (
    <div className="space-y-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-yellow-900">Please Confirm Payment Details</h4>
            <p className="text-sm text-yellow-700 mt-1">
              You are about to process payment for {selectedItems.length} items totaling {formatAmount(totalAmount)}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Payment Method</p>
            <p className="font-medium capitalize">{paymentData.method.replace('_', ' ')}</p>
          </div>
          {paymentData.referenceNumber && (
            <div>
              <p className="text-sm text-gray-500">Reference Number</p>
              <p className="font-medium">{paymentData.referenceNumber}</p>
            </div>
          )}
        </div>

        {paymentData.notes && (
          <div>
            <p className="text-sm text-gray-500">Notes</p>
            <p className="text-gray-700">{paymentData.notes}</p>
          </div>
        )}

        <div className="border-t pt-4">
          <h4 className="font-medium text-gray-900 mb-3">Payment Items</h4>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {selectedItems.map((item, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <div>
                  <p className="text-gray-700">{item.description}</p>
                  <p className="text-xs text-gray-500">
                    {item.payment_schedule?.enrollment?.student?.first_name} {item.payment_schedule?.enrollment?.student?.last_name}
                  </p>
                </div>
                <p className="font-medium">{formatAmount(item.net_amount)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
    </div>
  );

  const renderReceiptStep = () => (
    <div className="space-y-6">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <CheckCircle className="h-6 w-6 text-green-600" />
          <div>
            <h4 className="font-medium text-green-900">Payment Processed Successfully!</h4>
            <p className="text-sm text-green-700">Receipt has been generated</p>
          </div>
        </div>
      </div>

      {receipt && (
        <div className="border border-gray-200 rounded-lg p-6">
          <div className="text-center mb-4">
            <h3 className="text-lg font-bold">Payment Receipt</h3>
            <p className="text-sm text-gray-500">Receipt No: {receipt.receiptNumber}</p>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Date:</span>
              <span className="font-medium">{formatDate(receipt.date)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Method:</span>
              <span className="font-medium capitalize">{receipt.paymentMethod?.replace('_', ' ')}</span>
            </div>
            {receipt.referenceNumber && (
              <div className="flex justify-between">
                <span className="text-gray-600">Reference:</span>
                <span className="font-medium">{receipt.referenceNumber}</span>
              </div>
            )}
            <div className="border-t pt-3">
              <div className="flex justify-between">
                <span className="font-medium">Total Amount:</span>
                <span className="font-bold text-lg text-green-600">{formatAmount(receipt.amount)}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-6">
            <button className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2">
              <Printer className="h-4 w-4" />
              Print
            </button>
            <button className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2">
              <Mail className="h-4 w-4" />
              Email
            </button>
            <button className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2">
              <MessageSquare className="h-4 w-4" />
              WhatsApp
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const steps = [
    { title: 'Review', content: renderReviewStep },
    { title: 'Payment Method', content: renderPaymentMethodStep },
    { title: 'Confirm', content: renderConfirmationStep },
    { title: 'Receipt', content: renderReceiptStep }
  ];

  const canProceed = () => {
    if (currentStep === 1) {
      return paymentData.method === 'cash' || paymentData.referenceNumber;
    }
    return true;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Process Payment</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center justify-between mt-4">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  currentStep >= index ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {currentStep > index ? <CheckCircle className="h-5 w-5" /> : index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-24 h-0.5 ${
                    currentStep > index ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {steps[currentStep].content()}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between">
            <button
              onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
              disabled={currentStep === 0 || currentStep === 3}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                currentStep === 0 || currentStep === 3
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </button>

            {currentStep === 3 ? (
              <button
                onClick={() => {
                  onClose();
                  setCurrentStep(0);
                  setPaymentData({
                    method: 'cash',
                    amount: 0,
                    referenceNumber: '',
                    notes: '',
                    splitPayments: []
                  });
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                Done
              </button>
            ) : currentStep === 2 ? (
              <button
                onClick={handleProcessPayment}
                disabled={processing || !canProceed()}
                className={`px-6 py-2 rounded-lg flex items-center gap-2 ${
                  processing || !canProceed()
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {processing ? 'Processing...' : 'Process Payment'}
                <DollarSign className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={() => setCurrentStep(prev => Math.min(steps.length - 1, prev + 1))}
                disabled={!canProceed()}
                className={`px-6 py-2 rounded-lg flex items-center gap-2 ${
                  !canProceed()
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentProcessingModal;