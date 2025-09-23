import React, { useEffect, useState } from 'react';
import { DollarSign, Calendar, CreditCard, AlertTriangle, Info, Clock, CheckCircle, Package, TrendingUp } from 'lucide-react';
import Alert from '../Alert';
import { usePaymentScheduleService } from '../../../../application/hooks/useServices';

const PaymentSummaryStep = ({
  enrollmentId,
  selectedStudent,
  onScheduleCreated,
  loading = false
}) => {

  const paymentScheduleService = usePaymentScheduleService();
  const [preview, setPreview] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);
  const [scheduleCreated, setScheduleCreated] = useState(false);
  const [animateCards, setAnimateCards] = useState(false);

  useEffect(() => {
    setAnimateCards(true);
    if (enrollmentId) {
      loadPreview();
    }
  }, [enrollmentId]);

  const loadPreview = async () => {
    try {
      setLoadingPreview(true);
      setError(null);

      const result = await paymentScheduleService.previewSchedule(enrollmentId);

      if (result.success) {
        setPreview(result.data);
      } else {
        setError(result.error || 'Failed to load payment preview');
      }
    } catch (err) {
      setError(err.message || 'Failed to load payment preview');
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleCreateSchedule = async () => {
    try {
      setCreating(true);
      setError(null);

      const result = await paymentScheduleService.createSchedule(enrollmentId);

      if (result.success) {
        setScheduleCreated(true);
        if (onScheduleCreated) {
          onScheduleCreated(result.data);
        }
      } else {
        setError(result.error || 'Failed to create payment schedule');
      }
    } catch (err) {
      setError(err.message || 'Failed to create payment schedule');
    } finally {
      setCreating(false);
    }
  };

  const getPaymentMethodLabel = (preference) => {
    switch (preference) {
      case 'full':
        return 'Full Payment';
      case 'installments':
        return 'Installments (Based on fee structure)';
      default:
        return preference;
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

  const groupItemsByFee = (items) => {
    const grouped = {};
    items.forEach(item => {
      const feeName = item.fee_definition.name;
      if (!grouped[feeName]) {
        grouped[feeName] = {
          fee: item.fee_definition,
          installments: []
        };
      }
      grouped[feeName].installments.push(item);
    });
    return grouped;
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Header with Progress Indicator */}
      <div className="bg-gradient-to-r from-emerald-600 to-green-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-2xl font-bold flex items-center gap-2">
              <CreditCard className="h-7 w-7" />
              Payment Schedule Summary
            </h4>
            <p className="text-emerald-100 mt-2">
              Review and configure the payment schedule for this enrollment
            </p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
            <p className="text-sm font-medium">Step 5 of 5</p>
            <div className="w-32 bg-white/30 rounded-full h-2 mt-1">
              <div className="bg-white h-2 rounded-full" style={{ width: '100%' }} />
            </div>
          </div>
        </div>
      </div>

      {scheduleCreated && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <div>
              <p className="text-lg font-semibold text-green-900">Payment Schedule Created Successfully!</p>
              <p className="text-sm text-green-700 mt-1">The payment schedule has been generated and activated for this enrollment.</p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <Alert type="error" message={error} />
      )}

      {loadingPreview ? (
        <div className="bg-white rounded-xl shadow-lg p-12 flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          <p className="text-gray-600 mt-4">Loading payment preview...</p>
        </div>
      ) : preview ? (
        <>
          {/* Student & Enrollment Info */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 px-6 py-4 border-b border-gray-200">
              <h4 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Info className="h-6 w-6 text-emerald-600" />
                Enrollment Information
              </h4>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Student Name</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {preview.enrollment?.student?.first_name} {preview.enrollment?.student?.middle_name} {preview.enrollment?.student?.last_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Class</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {preview.enrollment?.class?.name || preview.enrollment?.class?.classname}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Academic Year</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {preview.enrollment?.academic_year?.name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Admission Type</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {preview.enrollment?.admission_type}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`bg-gradient-to-br from-emerald-50 to-white rounded-xl p-5 shadow-lg border-2 border-emerald-200 hover:scale-105 transition-all duration-300 ${animateCards ? 'animate-in fade-in slide-in-from-bottom-2' : ''}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Total Amount</p>
                  <p className="text-2xl font-bold text-emerald-700">{formatAmount(preview.totalAmount || 0)}</p>
                </div>
                <div className="bg-emerald-100 rounded-full p-2">
                  <DollarSign className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </div>

            <div className={`bg-gradient-to-br from-blue-50 to-white rounded-xl p-5 shadow-lg border-2 border-blue-200 hover:scale-105 transition-all duration-300 ${animateCards ? 'animate-in fade-in slide-in-from-bottom-2' : ''}`} style={{animationDelay: '100ms'}}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Payment Method</p>
                  <p className="text-lg font-bold text-blue-700">{getPaymentMethodLabel(preview.payment_preference)}</p>
                </div>
                <div className="bg-blue-100 rounded-full p-2">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className={`bg-gradient-to-br from-purple-50 to-white rounded-xl p-5 shadow-lg border-2 border-purple-200 hover:scale-105 transition-all duration-300 ${animateCards ? 'animate-in fade-in slide-in-from-bottom-2' : ''}`} style={{animationDelay: '200ms'}}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Total Items</p>
                  <p className="text-2xl font-bold text-purple-700">{preview.paymentItems?.length || 0}</p>
                </div>
                <div className="bg-purple-100 rounded-full p-2">
                  <Package className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Fee Breakdown */}
          {preview.paymentItems && preview.paymentItems.length > 0 ? (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-4 border-b border-gray-200">
                <h4 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 text-indigo-600" />
                  Fee Breakdown
                </h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fee Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Object.entries(groupItemsByFee(preview.paymentItems)).map(([feeName, feeData]) => (
                      <React.Fragment key={feeName}>
                        <tr className="bg-gray-50">
                          <td colSpan="2" className="px-6 py-3">
                            <div>
                              <p className="text-sm font-semibold text-gray-900">{feeName}</p>
                              <p className="text-xs text-gray-500">
                                {feeData.fee.type?.name} - {feeData.fee.frequency}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-3 text-right">
                            <p className="text-sm font-semibold text-gray-900">
                              {formatAmount(feeData.fee.base_amount)}
                            </p>
                          </td>
                          <td></td>
                        </tr>
                        {feeData.installments.map((item, index) => (
                          <tr key={index} className="hover:bg-gray-50 transition-colors">
                            <td></td>
                            <td className="px-6 py-3">
                              <p className="text-sm text-gray-700">{item.description}</p>
                            </td>
                            <td className="px-6 py-3 text-right">
                              <p className="text-sm text-gray-900">{formatAmount(item.amount)}</p>
                            </td>
                            <td className="px-6 py-3 text-center">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                <Clock className="h-3 w-3 mr-1" />
                                {formatDate(item.due_date)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-100 border-t-2 border-gray-300">
                    <tr>
                      <td colSpan="2" className="px-6 py-4">
                        <p className="text-lg font-bold text-gray-900">Total Amount</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="text-xl font-bold text-emerald-600">
                          {formatAmount(preview.totalAmount || 0)}
                        </p>
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
                <div>
                  <p className="text-lg font-semibold text-yellow-900">No Fees Configured</p>
                  <p className="text-sm text-yellow-700 mt-1">
                    No fees are configured for this enrollment. Please ensure fee assignments are set up for the selected class and admission type.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Button */}
          {!scheduleCreated && preview.paymentItems && preview.paymentItems.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <button
                type="button"
                onClick={handleCreateSchedule}
                disabled={creating}
                className={`w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300 ${
                  creating
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 hover:shadow-xl hover:scale-[1.02]'
                }`}
              >
                {creating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Creating Payment Schedule...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-5 w-5" />
                    Create Payment Schedule
                  </>
                )}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
          <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg font-medium">No Payment Preview Available</p>
          <p className="text-sm text-gray-500 mt-2">Please ensure the enrollment is properly configured</p>
        </div>
      )}
    </div>
  );
};

export default PaymentSummaryStep;