import React, { useEffect, useState } from 'react';
import { useFeeService, useFeeTypeService } from '../../../application/hooks/useServices';
import InstallmentManager from '../fees/InstallmentManager';
import { useComponentLoading } from '../../../application/contexts/LoadingContext';
import {
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  DollarSign,
  Calendar,
  AlertCircle,
  Check,
  ChevronDown,
  ChevronUp,
  MapPin,
  FileText,
  CreditCard
} from 'lucide-react';

const BusStopFeeManager = ({ stopId, stopName, onClose }) => {
  const feeService = useFeeService();
  const feeTypeService = useFeeTypeService();
  const setLoading = useComponentLoading('BusStopFeeManager');
  const [assignments, setAssignments] = useState([]);
  const [definitions, setDefinitions] = useState([]);
  const [feeTypes, setFeeTypes] = useState([]);
  const [showAddFee, setShowAddFee] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedType, setSelectedType] = useState('all');
  const [expandedAssignments, setExpandedAssignments] = useState({});

  // Form state for new fee definition
  const [newFee, setNewFee] = useState({
    name: '',
    type: '',
    base_amount: '',
    frequency: 'monthly',
    installments: []
  });

  // Form state for assignment
  const [assignment, setAssignment] = useState({
    fee: '',
    priority: 10,
    start_date: '',
    end_date: ''
  });

  useEffect(() => {
    if (stopId) {
      loadData();
    }
  }, [stopId]);

  const loadData = async () => {
    setLoading(true, 'Loading fee data for bus stop');
    try {
      console.log('Loading data for bus stop:', stopId);
      const [assignmentsResult, defsResult, typesResult] = await Promise.all([
        feeService.getFeeAssignmentsByBusStop(stopId),
        feeService.getAllFeeDefinitions(),
        feeTypeService.getAllFeeTypes()
      ]);
      console.log('Raw assignments data from API:', assignmentsResult.data);

      // Process assignments - Strapi v5 only
      const processedAssignments = assignmentsResult.data || [];

      console.log('Loaded assignments:', processedAssignments);
      setAssignments(processedAssignments);
      setDefinitions(defsResult.data || []);
      setFeeTypes(typesResult.data || []);
    } catch (error) {
      console.error('Error loading fee data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createFeeDefinition = async () => {
    try {
      const payload = {
        ...newFee,
        type: Number(newFee.type),
        base_amount: Number(newFee.base_amount)
      };

      const result = await feeService.createFeeDefinition(payload);
      const createdDef = result.data;
      setDefinitions([createdDef, ...definitions]);

      // Auto-assign to this bus stop
      await assignFeeToStop(createdDef.id);

      // Reset form
      setNewFee({
        name: '',
        type: '',
        base_amount: '',
        frequency: 'monthly',
        installments: []
      });
      setShowAddFee(false);
    } catch (error) {
      console.error('Error creating fee definition:', error);
    }
  };

  const assignFeeToStop = async (feeId) => {
    try {
      const payload = {
        fee: Number(feeId || assignment.fee),
        bus_stop: Number(stopId),
        priority: Number(assignment.priority || 10),
        start_date: assignment.start_date || null,
        end_date: assignment.end_date || null
      };

      await feeService.createFeeAssignment(payload);
      await loadData();

      // Reset assignment form
      setAssignment({
        fee: '',
        priority: 10,
        start_date: '',
        end_date: ''
      });
    } catch (error) {
      console.error('Error assigning fee:', error);
    }
  };

  const removeAssignment = async (id) => {
    const confirmed = window.confirm(
      'Remove this fee from the bus stop?\n\n' +
      'This will unlink the fee from this bus stop only.\n' +
      'The fee definition will still be available for other stops.'
    );

    if (confirmed) {
      try {
        console.log('Deleting fee assignment with ID:', id);
        const deleteResponse = await feeService.deleteFeeAssignment(id);
        console.log('Delete response:', deleteResponse);
        alert('Fee removed from bus stop successfully!');
        console.log('Reloading data after deletion...');
        await loadData();
      } catch (error) {
        console.error('Error removing assignment:', error);
        alert('Failed to remove fee assignment. Please try again.');
      }
    }
  };

  const deleteFeeDefinition = async (feeId, feeName) => {
    if (!feeId) {
      alert('Cannot delete: Fee ID not found');
      return;
    }

    const confirmed = window.confirm(
      `⚠️ WARNING: Delete fee "${feeName}" permanently?\n\n` +
      'This will:\n' +
      '• Remove this fee from ALL bus stops using it\n' +
      '• Delete all associated installment schedules\n' +
      '• This action CANNOT be undone\n\n' +
      'Are you absolutely sure?'
    );

    if (confirmed) {
      const doubleConfirm = window.confirm(
        `Final confirmation: Delete "${feeName}" fee permanently?`
      );

      if (doubleConfirm) {
        try {
          // First, get all assignments using this fee
          const allAssignments = assignments.filter(a => a.fee?.id === feeId);

          // Delete all assignments for this fee
          for (const assignment of allAssignments) {
            await feeService.deleteFeeAssignment(assignment.id);
          }

          // Then delete the fee definition itself
          await feeService.deleteFeeDefinition(feeId);

          alert(`Fee "${feeName}" has been permanently deleted.`);
          await loadData();
        } catch (error) {
          console.error('Error deleting fee definition:', error);
          alert(`Failed to delete fee: ${error.message || 'Unknown error'}`);
        }
      }
    }
  };

  const getFrequencyIcon = (frequency) => {
    switch (frequency) {
      case 'yearly': return '📅';
      case 'quarterly': return '📊';
      case 'term': return '📚';
      case 'monthly': return '🗓️';
      case 'one_time': return '✔️';
      default: return '💰';
    }
  };

  const getFrequencyColor = (frequency) => {
    switch (frequency) {
      case 'yearly': return 'bg-blue-100 text-blue-700';
      case 'quarterly': return 'bg-indigo-100 text-indigo-700';
      case 'term': return 'bg-green-100 text-green-700';
      case 'monthly': return 'bg-yellow-100 text-yellow-700';
      case 'one_time': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Group assignments by fee type - with null check
  const groupedAssignments = assignments && assignments.length > 0
    ? assignments.reduce((acc, assignment) => {
        const typeName = assignment.fee?.type?.name || assignment.fee?.type?.data?.attributes?.name || 'Other';
        if (!acc[typeName]) {
          acc[typeName] = [];
        }
        acc[typeName].push(assignment);
        return acc;
      }, {})
    : {};

  // Calculate total fees - with null check and proper data extraction
  const totalFees = assignments && assignments.length > 0
    ? assignments.reduce((sum, a) => {
        // Handle both direct and nested data structures from Strapi
        const feeData = a.fee?.data?.attributes || a.fee;
        const amount = Number(feeData?.base_amount || 0);
        const frequency = feeData?.frequency;

        // Normalize to yearly amount for calculation
        const yearlyAmount = frequency === 'monthly' ? amount * 12 :
                            frequency === 'quarterly' ? amount * 4 :
                            frequency === 'term' ? amount * 2 :
                            amount;

        return sum + yearlyAmount;
      }, 0)
    : 0;

  // Get available fees that are not already assigned
  const getAvailableFees = () => {
    const assignedFeeIds = assignments.map(a => a.fee?.id || a.fee);
    return definitions.filter(def => !assignedFeeIds.includes(def.id));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <MapPin className="w-6 h-6" />
                Fee Structure for {stopName}
              </h2>
              <p className="text-green-100 mt-1">
                Total Annual Fees: <span className="font-bold">₹{totalFees.toLocaleString()}</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAddFee(!showAddFee)}
                className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Fee
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Current Assignments */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Assigned Fees
            </h3>

            {assignments.length === 0 ? (
              <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No fees assigned to this bus stop</p>
              </div>
            ) : (
              <div className="space-y-3">
                {assignments.map((assignment) => (
                  <div key={assignment.id} className="bg-white border rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <CreditCard className="h-5 w-5 text-green-600" />
                          <div>
                            <h4 className="font-semibold text-gray-800">
                              {assignment.fee?.name || 'Unknown Fee'}
                            </h4>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                              <span>₹{assignment.fee?.base_amount || 0}</span>
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                                {assignment.fee?.frequency || 'One-time'}
                              </span>
                              <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded">
                                Priority: {assignment.priority}
                              </span>
                            </div>
                            {(assignment.start_date || assignment.end_date) && (
                              <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                                <Calendar className="h-3 w-3" />
                                <span>
                                  {assignment.start_date && `From: ${new Date(assignment.start_date).toLocaleDateString()}`}
                                  {assignment.start_date && assignment.end_date && ' • '}
                                  {assignment.end_date && `To: ${new Date(assignment.end_date).toLocaleDateString()}`}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => removeAssignment(assignment.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add New Assignment */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Plus className="h-5 w-5 text-green-600" />
              Add Fee to Bus Stop
            </h3>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="mb-4">
                <label className="flex items-center gap-2 mb-3">
                  <input
                    type="checkbox"
                    checked={showAddFee}
                    onChange={(e) => setShowAddFee(e.target.checked)}
                    className="h-4 w-4 text-green-600"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Create new fee definition
                  </span>
                </label>
              </div>

              {showAddFee ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fee Name
                      </label>
                      <input
                        type="text"
                        value={newFee.name}
                        onChange={(e) => setNewFee({ ...newFee, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="e.g., Bus Stop Maintenance Fee"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fee Type
                      </label>
                      <select
                        value={newFee.type}
                        onChange={(e) => setNewFee({ ...newFee, type: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="">Select Type</option>
                        {feeTypes.map(type => (
                          <option key={type.id} value={type.id}>
                            {type.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Amount (₹)
                      </label>
                      <input
                        type="number"
                        value={newFee.base_amount}
                        onChange={(e) => setNewFee({ ...newFee, base_amount: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Frequency
                      </label>
                      <select
                        value={newFee.frequency}
                        onChange={(e) => setNewFee({ ...newFee, frequency: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                        <option value="yearly">Yearly</option>
                        <option value="one-time">One Time</option>
                      </select>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Existing Fee
                  </label>
                  <select
                    value={assignment.fee}
                    onChange={(e) => setAssignment({ ...assignment, fee: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select Fee</option>
                    {getAvailableFees().map(def => (
                      <option key={def.id} value={def.id}>
                        {def.name} - ₹{def.base_amount} ({def.frequency})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <input
                    type="number"
                    value={assignment.priority}
                    onChange={(e) => setAssignment({ ...assignment, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={assignment.start_date}
                    onChange={(e) => setAssignment({ ...assignment, start_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={assignment.end_date}
                    onChange={(e) => setAssignment({ ...assignment, end_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <button
                  onClick={assignFeeToStop}
                  disabled={!assignment.fee && (!showAddFee || !newFee.name || !newFee.type || !newFee.base_amount)}
                  className="px-6 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:from-green-700 hover:to-teal-700 disabled:opacity-50 flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Assign Fee to Stop
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusStopFeeManager;