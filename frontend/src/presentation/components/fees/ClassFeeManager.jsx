import React, { useEffect, useState } from 'react';
import { FeeAssignmentRepository } from '../../../data/repositories/FeeAssignmentRepository';
import { FeeDefinitionRepository } from '../../../data/repositories/FeeDefinitionRepository';
import { FeeTypeRepository } from '../../../data/repositories/FeeTypeRepository';
import InstallmentManager from './InstallmentManager';
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
  School,
  FileText,
  CreditCard
} from 'lucide-react';

const ClassFeeManager = ({ classId, className }) => {
  const [assignments, setAssignments] = useState([]);
  const [definitions, setDefinitions] = useState([]);
  const [feeTypes, setFeeTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddFee, setShowAddFee] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedType, setSelectedType] = useState('all');
  const [expandedAssignments, setExpandedAssignments] = useState({});

  // Form state for new fee definition
  const [newFee, setNewFee] = useState({
    name: '',
    type: '',
    base_amount: '',
    frequency: 'yearly',
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
    if (classId) {
      loadData();
    }
  }, [classId]);

  const loadData = async () => {
    setLoading(true);
    try {
      console.log('Loading data for class:', classId);
      const [assignmentsData, defsData, typesData] = await Promise.all([
        FeeAssignmentRepository.findByClass(classId),
        FeeDefinitionRepository.findAll(),
        FeeTypeRepository.findAll()
      ]);
      console.log('Raw assignments data from API:', assignmentsData);

      // Process assignments to ensure proper data structure
      const processedAssignments = (assignmentsData || []).map(assignment => {
        // Handle Strapi v4/v5 data structure
        if (assignment.attributes) {
          return {
            id: assignment.id,
            ...assignment.attributes,
            fee: assignment.attributes.fee?.data ? {
              id: assignment.attributes.fee.data.id,
              ...assignment.attributes.fee.data.attributes
            } : assignment.attributes.fee
          };
        }
        return assignment;
      });

      console.log('Loaded assignments:', processedAssignments);
      setAssignments(processedAssignments);
      setDefinitions(defsData || []);
      setFeeTypes(typesData || []);
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

      const createdDef = await FeeDefinitionRepository.create(payload);
      setDefinitions([createdDef, ...definitions]);

      // Auto-assign to this class
      await assignFeeToClass(createdDef.id);

      // Reset form
      setNewFee({
        name: '',
        type: '',
        base_amount: '',
        frequency: 'yearly',
        installments: []
      });
      setShowAddFee(false);
    } catch (error) {
      console.error('Error creating fee definition:', error);
    }
  };

  const assignFeeToClass = async (feeId) => {
    try {
      const payload = {
        fee: Number(feeId || assignment.fee),
        class: Number(classId),
        priority: Number(assignment.priority || 10),
        start_date: assignment.start_date || null,
        end_date: assignment.end_date || null
      };

      await FeeAssignmentRepository.create(payload);
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
      'Remove this fee from the class?\n\n' +
      'This will unlink the fee from this class only.\n' +
      'The fee definition will still be available for other classes.'
    );

    if (confirmed) {
      try {
        console.log('Deleting fee assignment with ID:', id);
        const deleteResponse = await FeeAssignmentRepository.delete(id);
        console.log('Delete response:', deleteResponse);
        alert('Fee removed from class successfully!');
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
      '• Remove this fee from ALL classes using it\n' +
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
            await FeeAssignmentRepository.delete(assignment.id);
          }

          // Then delete the fee definition itself
          await FeeDefinitionRepository.delete(feeId);

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
      case 'term': return '📚';
      case 'monthly': return '🗓️';
      case 'one_time': return '✔️';
      default: return '💰';
    }
  };

  const getFrequencyColor = (frequency) => {
    switch (frequency) {
      case 'yearly': return 'bg-blue-100 text-blue-700';
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
                            frequency === 'term' ? amount * 2 :
                            amount;

        return sum + yearlyAmount;
      }, 0)
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <School className="w-6 h-6 text-blue-600" />
            Fee Structure for {className}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Total Annual Fees: <span className="font-bold text-green-600">₹{totalFees.toLocaleString()}</span>
          </p>
        </div>
        <button
          onClick={() => setShowAddFee(!showAddFee)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Fee
        </button>
      </div>

      {/* Quick Add Fee Form */}
      {showAddFee && (
        <div className="bg-white border border-blue-200 rounded-lg p-6 space-y-4">
          <h3 className="font-semibold text-gray-700 mb-4">Quick Add Fee to Class</h3>

          {/* Option 1: Select Existing Fee */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Option 1: Assign Existing Fee</h4>
            <div className="flex gap-3">
              <select
                className="flex-1 px-3 py-2 border rounded-lg"
                value={assignment.fee}
                onChange={(e) => setAssignment({...assignment, fee: e.target.value})}
              >
                <option value="">Select a fee...</option>
                {definitions
                  .filter(d => !assignments.some(a => a.fee?.id === d.id))
                  .map(def => (
                    <option key={def.id} value={def.id}>
                      {def.name} - {def.frequency} - ₹{def.base_amount}
                    </option>
                  ))}
              </select>
              <button
                onClick={() => assignFeeToClass()}
                disabled={!assignment.fee}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                Assign
              </button>
            </div>
          </div>

          {/* Option 2: Create New Fee */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Option 2: Create New Fee</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <input
                type="text"
                placeholder="Fee Name"
                className="px-3 py-2 border rounded-lg"
                value={newFee.name}
                onChange={(e) => setNewFee({...newFee, name: e.target.value})}
              />
              <select
                className="px-3 py-2 border rounded-lg"
                value={newFee.type}
                onChange={(e) => setNewFee({...newFee, type: e.target.value})}
              >
                <option value="">Select Type...</option>
                {feeTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Amount"
                className="px-3 py-2 border rounded-lg"
                value={newFee.base_amount}
                onChange={(e) => setNewFee({...newFee, base_amount: e.target.value})}
              />
              <select
                className="px-3 py-2 border rounded-lg"
                value={newFee.frequency}
                onChange={(e) => setNewFee({...newFee, frequency: e.target.value})}
              >
                <option value="yearly">Yearly</option>
                <option value="term">Per Term</option>
                <option value="monthly">Monthly</option>
                <option value="one_time">One Time</option>
              </select>
            </div>
            <button
              onClick={createFeeDefinition}
              disabled={!newFee.name || !newFee.type || !newFee.base_amount}
              className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Create & Assign
            </button>
          </div>

          <button
            onClick={() => setShowAddFee(false)}
            className="text-gray-600 hover:text-gray-800 text-sm"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Fee Categories */}
      <div className="space-y-4">
        {Object.entries(groupedAssignments).map(([typeName, typeAssignments]) => (
          <div key={typeName} className="bg-white rounded-lg border border-gray-200">
            <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border-b">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-700">{typeName} Fees</h3>
                <span className="text-sm text-gray-600">
                  {typeAssignments.length} fee{typeAssignments.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              {typeAssignments.map((assignment) => (
                <div key={assignment.id} className="p-4 hover:bg-gray-50 transition-colors relative overflow-visible">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <CreditCard className="w-5 h-5 text-gray-400 mt-1" />
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-gray-800">{assignment.fee?.name}</p>
                              <div className="flex items-center gap-3 mt-1">
                                <span className={`text-xs px-2 py-1 rounded-full ${getFrequencyColor(assignment.fee?.frequency)}`}>
                                  {getFrequencyIcon(assignment.fee?.frequency)} {assignment.fee?.frequency}
                                </span>
                                <span className="text-sm text-gray-600">
                                  ₹{assignment.fee?.base_amount?.toLocaleString()}
                                </span>
                                {assignment.priority && (
                                  <span className="text-xs text-gray-500">
                                    Priority: {assignment.priority}
                                  </span>
                                )}
                                {assignment.start_date && (
                                  <span className="text-xs text-gray-500">
                                    From: {new Date(assignment.start_date).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Fee Actions Button - Opens downward with high z-index */}
                            <div className="relative group ml-4" style={{zIndex: 50}}>
                              <button
                                className="p-2 bg-white hover:bg-gray-100 rounded-lg transition-colors border border-gray-300 shadow-sm"
                                title="Fee Actions"
                              >
                                <ChevronDown className="w-4 h-4 text-gray-600" />
                              </button>
                              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-2xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200" style={{zIndex: 9999}}>
                          <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                            <p className="text-xs text-gray-500 font-medium">Fee Actions</p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeAssignment(assignment.id);
                            }}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-yellow-50 flex items-center gap-2 text-yellow-700"
                          >
                            <X className="w-4 h-4" />
                            <span>Remove from Class</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteFeeDefinition(assignment.fee?.id, assignment.fee?.name);
                            }}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 flex items-center gap-2 text-red-600 border-t border-gray-100"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Delete Fee Permanently</span>
                          </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expandable Installment Manager */}
                  <div className="mt-2 pl-8">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedAssignments(prev => ({
                          ...prev,
                          [assignment.id]: !prev[assignment.id]
                        }));
                      }}
                      className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      {expandedAssignments[assignment.id] ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      {assignment.fee?.installments?.length > 0
                        ? `View ${assignment.fee.installments.length} installments`
                        : 'Setup installments'
                      }
                    </button>
                  </div>

                  {/* Installment Manager */}
                  {expandedAssignments[assignment.id] && (
                    <div className="mt-3 pl-4 pr-2 border-t pt-3">
                      <InstallmentManager
                        fee={assignment.fee}
                        totalAmount={assignment.fee?.base_amount || 0}
                        frequency={assignment.fee?.frequency}
                        onUpdate={async (installments) => {
                          // Update the fee definition with new installments
                          try {
                            console.log('Assignment object:', assignment);
                            console.log('Fee object:', assignment.fee);

                            // Get the correct fee ID
                            const feeId = assignment.fee?.id || assignment.fee?.data?.id;
                            const feeData = assignment.fee?.data?.attributes || assignment.fee;

                            console.log('Fee ID:', feeId, 'Fee Data:', feeData);

                            if (!feeId) {
                              throw new Error('Fee ID not found. Please refresh and try again.');
                            }

                            // Build the complete update payload
                            // For Strapi, we need to include all existing required fields
                            const updatePayload = {
                              name: feeData.name,
                              type: feeData.type?.id || feeData.type,
                              base_amount: feeData.base_amount,
                              frequency: feeData.frequency,
                              calculation_method: feeData.calculation_method || 'flat',
                              currency: feeData.currency || 'INR',
                              installments: installments
                            };

                            console.log('Updating fee definition ID:', feeId, 'with payload:', updatePayload);

                            const result = await FeeDefinitionRepository.update(feeId, updatePayload);
                            console.log('Update result:', result);

                            // Show success message
                            alert('Installments saved successfully!');

                            // Reload data to show updated installments
                            await loadData();
                          } catch (error) {
                            console.error('Error updating installments:', error);
                            if (error.response) {
                              console.error('Error response:', error.response.data);
                              alert(`Failed to save installments: ${error.response.data?.error?.message || 'Unknown error'}`);
                            } else {
                              alert('Failed to save installments. Please check console for details.');
                            }
                          }
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {assignments.length === 0 && (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">No fees assigned to this class</p>
            <p className="text-sm text-gray-500 mt-1">Click "Add Fee" to get started</p>
          </div>
        )}
      </div>

      {/* Summary Card */}
      {assignments.length > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
          <h3 className="font-semibold text-gray-800 mb-4">Fee Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Total Annual Fees</p>
              <p className="text-2xl font-bold text-green-600">₹{totalFees.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Number of Fees</p>
              <p className="text-2xl font-bold text-blue-600">{assignments.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Fee Categories</p>
              <p className="text-2xl font-bold text-purple-600">{Object.keys(groupedAssignments).length}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassFeeManager;