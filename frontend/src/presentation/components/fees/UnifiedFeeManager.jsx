import React, { useEffect, useState } from 'react';
import { useFeeService, useFeeTypeService } from '../../../application/contexts/ServiceContext';
import InstallmentManager from './InstallmentManager';
import { useComponentLoading } from '../../../application/contexts/LoadingContext';
import { getEntityFeeConfig } from '../../../config/feeConfig';
import {
  Plus,
  Trash2,
  X,
  DollarSign,
  Calendar,
  AlertCircle,
  Check,
  ChevronDown,
  ChevronUp,
  School,
  MapPin,
  CreditCard,
  CheckCircle,
  Loader2
} from 'lucide-react';

/**
 * UnifiedFeeManager - A single component for managing fees across all entity types
 * Uses global loading overlay instead of local loading states
 * Updated: Fixed loading state to use global loading only - no local loading state
 *
 * @param {string} entityType - 'class' | 'busStop' | 'student' | 'busRoute'
 * @param {number} entityId - ID of the entity
 * @param {string} entityName - Display name of the entity
 * @param {function} onClose - Optional callback for modal mode
 */
const UnifiedFeeManager = ({
  entityType,
  entityId,
  entityName,
  onClose
}) => {
  const setLoading = useComponentLoading('UnifiedFeeManager');
  const feeService = useFeeService();
  const feeTypeService = useFeeTypeService();
  const [assignments, setAssignments] = useState([]);
  const [definitions, setDefinitions] = useState([]);
  const [feeTypes, setFeeTypes] = useState([]);
  const [showAddFee, setShowAddFee] = useState(false);
  const [expandedAssignments, setExpandedAssignments] = useState({});

  // UI feedback states
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recentlyAddedId, setRecentlyAddedId] = useState(null);

  // Form state for new fee definition
  const [newFee, setNewFee] = useState({
    name: '',
    type: '',
    base_amount: '',
    frequency: entityType === 'busStop' ? 'monthly' : 'yearly',
    installments: []
  });

  // Form state for assignment
  const [assignment, setAssignment] = useState({
    fee: '',
    priority: 10,
    start_date: '',
    end_date: ''
  });

  // Get entity-specific configuration
  const getEntityConfig = () => {
    const feeConfig = getEntityFeeConfig(entityType);

    switch (entityType) {
      case 'class':
        return {
          icon: School,
          color: 'blue',
          title: 'Class',
          fieldName: 'class',
          fetchMethod: (id) => feeService.getFeeAssignmentsByClass(id).then(result => result.success ? result.data : []),
          defaultFrequency: 'yearly',
          ...feeConfig
        };
      case 'busStop':
        return {
          icon: MapPin,
          color: 'green',
          title: 'Bus Stop',
          fieldName: 'bus_stop',
          fetchMethod: (id) => feeService.getFeeAssignmentsByBusStop(id).then(result => result.success ? result.data : []),
          defaultFrequency: 'monthly',
          ...feeConfig
        };
      // Add more entity types as needed
      default:
        throw new Error(`Unsupported entity type: ${entityType}`);
    }
  };

  const config = getEntityConfig();
  const Icon = config.icon;

  // Show success message with auto-hide
  const showSuccess = (message, isError = false) => {
    setSuccessMessage({ text: message, isError });
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  useEffect(() => {
    if (entityId) {
      loadData();
    }
  }, [entityId, entityType]);

  const loadData = async () => {
    setLoading(true, `Loading fee data for ${entityName}`);
    try {
      console.log(`Loading data for ${entityType}:`, entityId);
      console.log('Config:', config);

      // Use entity-specific fetch method
      const [assignmentsData, defsResult, typesResult] = await Promise.all([
        config.fetchMethod(entityId),
        feeService.getAllFeeDefinitions(),
        feeTypeService.getAllFeeTypes()
      ]);
      const defsData = defsResult.success ? defsResult.data : [];
      const typesData = typesResult.success ? typesResult.data : [];

      console.log(`Raw assignments data from API for ${entityType}:`, assignmentsData);
      console.log('Definitions data:', defsData);
      console.log('Fee types data:', typesData);

      // Process assignments - Strapi v5 only
      const processedAssignments = assignmentsData || [];

      const filteredTypes = (typesData || []).filter(type =>
        config.allowedFeeTypes.includes(type.name)
      );

      // Filter definitions to only show those matching allowed fee types
      const filteredDefinitions = (defsData || []).filter(def => {
        const feeType = typesData?.find(t => t.id === def.type?.id || t.id === def.type);
        return feeType && config.allowedFeeTypes.includes(feeType.name);
      });

      setAssignments(processedAssignments);
      setDefinitions(filteredDefinitions);
      setFeeTypes(filteredTypes);
    } catch (error) {
      console.error('Error loading fee data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createFeeDefinition = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...newFee,
        type: Number(newFee.type),
        base_amount: Number(newFee.base_amount)
      };

      const createResult = await feeService.createFeeDefinition(payload);
      if (!createResult.success) throw new Error(createResult.error);
      const createdDef = createResult.data;

      console.log('UnifiedFeeManager - Created fee definition result:', JSON.stringify(createdDef, null, 2));
      console.log('UnifiedFeeManager - Created fee ID:', createdDef?.id);
      console.log('UnifiedFeeManager - Created fee documentId:', createdDef?.documentId);

      // Check if we have an ID to work with
      if (!createdDef?.id) {
        console.error('UnifiedFeeManager - ERROR: No ID returned from created fee definition!');
        console.error('UnifiedFeeManager - Full created def object:', createdDef);
        throw new Error('Fee was created but no ID was returned. Cannot assign to entity.');
      }

      setDefinitions([createdDef, ...definitions]);

      // Auto-assign to this entity and reload data
      const newAssignment = await assignFeeToEntity(createdDef.id, true);

      // Reload data to get the complete assignment with all relations
      await loadData();

      // Strapi 5: Direct id access
      if (newAssignment?.id) {
        setRecentlyAddedId(newAssignment.id);
        setTimeout(() => setRecentlyAddedId(null), 3000);
      }

      // Show success message
      showSuccess(`Fee "${newFee.name}" created and assigned successfully!`);

      // Reset form
      setNewFee({
        name: '',
        type: '',
        base_amount: '',
        frequency: config.defaultFrequency,
        installments: []
      });
      setShowAddFee(false);
    } catch (error) {
      console.error('Error creating fee definition:', error);
      showSuccess('Failed to create fee. Please try again.', true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const assignFeeToEntity = async (feeId, skipReload = false) => {
    if (!skipReload) setIsSubmitting(true);
    try {
      // Build payload with entity-specific field name
      const payload = {
        fee: Number(feeId || assignment.fee),
        [config.fieldName]: Number(entityId), // Dynamic field based on entity type
        priority: Number(assignment.priority || 10),
        start_date: assignment.start_date || null,
        end_date: assignment.end_date || null
      };

      const createResult = await feeService.createFeeAssignment(payload);
      if (!createResult.success) throw new Error(createResult.error);
      const newAssignment = createResult.data;

      if (!skipReload) {
        await loadData();

        // Find the fee name for the success message
        const assignedFee = definitions.find(d => d.id === Number(feeId || assignment.fee));
        showSuccess(`Fee "${assignedFee?.name || 'Fee'}" assigned successfully!`);

        // Highlight the new assignment
        // Strapi 5: Direct id access
        if (newAssignment?.id) {
          setRecentlyAddedId(newAssignment.id);
          setTimeout(() => setRecentlyAddedId(null), 3000);
        }
      }

      // Reset assignment form
      setAssignment({
        fee: '',
        priority: 10,
        start_date: '',
        end_date: ''
      });

      return newAssignment;
    } catch (error) {
      console.error('Error assigning fee:', error);
      if (!skipReload) showSuccess('Failed to assign fee. Please try again.', true);
    } finally {
      if (!skipReload) setIsSubmitting(false);
    }
  };

  const removeAssignment = async (id) => {
    const confirmed = window.confirm(
      `Remove this fee from the ${config.title.toLowerCase()}?\n\n` +
      `This will unlink the fee from this ${config.title.toLowerCase()} only.\n` +
      'The fee definition will still be available for other entities.'
    );

    if (confirmed) {
      setIsSubmitting(true);
      try {
        console.log('Deleting fee assignment with ID:', id);
        const deleteResult = await feeService.deleteFeeAssignment(id);
        if (!deleteResult.success) throw new Error(deleteResult.error);
        const deleteResponse = deleteResult.data;
        console.log('Delete response:', deleteResponse);
        showSuccess(`Fee removed from ${config.title.toLowerCase()} successfully!`);
        console.log('Reloading data after deletion...');
        await loadData();
      } catch (error) {
        console.error('Error removing assignment:', error);
        showSuccess('Failed to remove fee assignment. Please try again.', true);
      } finally {
        setIsSubmitting(false);
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
      `• Remove this fee from ALL ${config.title.toLowerCase()}s using it\n` +
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
            const delResult = await feeService.deleteFeeAssignment(assignment.id);
            if (!delResult.success) console.error('Failed to delete assignment:', delResult.error);
          }

          // Then delete the fee definition itself
          const delResult = await feeService.deleteFeeDefinition(feeId);
          if (!delResult.success) throw new Error(delResult.error);

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

  // Group assignments by fee type
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

  // Calculate total fees
  const totalFees = assignments && assignments.length > 0
    ? assignments.reduce((sum, a) => {
        const feeData = a.fee?.data?.attributes || a.fee;
        const amount = Number(feeData?.base_amount || 0);
        const frequency = feeData?.frequency;

        // Normalize to yearly amount
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

  // Determine color classes based on entity type (Tailwind needs complete class names)
  const getColorClasses = () => {
    if (entityType === 'busStop') {
      return {
        icon: 'text-green-600',
        button: 'bg-green-600 hover:bg-green-700',
        border: 'border-green-200',
        bg: 'bg-green-50',
        text: 'text-green-600',
        gradient: 'from-green-50 to-teal-50 border-green-200'
      };
    }
    // Default for class and others
    return {
      icon: 'text-blue-600',
      button: 'bg-blue-600 hover:bg-blue-700',
      border: 'border-blue-200',
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      gradient: 'from-blue-50 to-indigo-50 border-blue-200'
    };
  };

  const colors = getColorClasses();

  // Don't render header in content if we're in modal mode (modal has its own header)
  const showContentHeader = !onClose;

  const content = (
    <div className="space-y-6">
      {/* Success/Error Notification */}
      {successMessage && (
        <div
          className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 animate-slide-in ${
            successMessage.isError
              ? 'bg-red-50 text-red-800 border border-red-200'
              : 'bg-green-50 text-green-800 border border-green-200'
          }`}
          style={{
            animation: 'slideIn 0.3s ease-out, fadeOut 0.5s ease-in 3.5s forwards'
          }}
        >
          {successMessage.isError ? (
            <AlertCircle className="w-5 h-5 text-red-600" />
          ) : (
            <CheckCircle className="w-5 h-5 text-green-600" />
          )}
          <span className="font-medium">{successMessage.text}</span>
        </div>
      )}

      {/* Header - only show if not in modal mode */}
      {showContentHeader && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Icon className={`w-6 h-6 ${colors.icon}`} />
              Fee Structure for {entityName}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Total Annual Fees: <span className="font-bold text-green-600">₹{totalFees.toLocaleString()}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddFee(!showAddFee)}
              className={`px-4 py-2 text-white rounded-lg flex items-center gap-2 ${colors.button}`}
            >
              <Plus className="w-4 h-4" />
              Add Fee
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Quick Add Fee Form */}
      {showAddFee && (
        <div className={`bg-white border rounded-lg p-6 space-y-4 ${colors.border}`}>
          <h3 className="font-semibold text-gray-700 mb-4">Quick Add Fee to {config.title}</h3>

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
                {getAvailableFees()
                  .map(def => (
                    <option key={def.id} value={def.id}>
                      {def.name} - {def.frequency} - ₹{def.base_amount}
                    </option>
                  ))}
              </select>
              <button
                onClick={() => assignFeeToEntity()}
                disabled={!assignment.fee || isSubmitting}
                className={`px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Assigning...
                  </>
                ) : (
                  'Assign'
                )}
              </button>
            </div>
          </div>

          {/* Option 2: Create New Fee */}
          <div className={`p-4 rounded-lg ${colors.bg}`}>
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
                <option value="quarterly">Quarterly</option>
                <option value="term">Per Term</option>
                <option value="monthly">Monthly</option>
                <option value="one_time">One Time</option>
              </select>
            </div>
            <button
              onClick={createFeeDefinition}
              disabled={!newFee.name || !newFee.type || !newFee.base_amount || isSubmitting}
              className={`mt-3 px-4 py-2 text-white rounded-lg disabled:opacity-50 flex items-center gap-2 ${colors.button}`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Create & Assign
                </>
              )}
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
                <div
                  key={assignment.id}
                  className={`p-4 hover:bg-gray-50 transition-all duration-500 relative overflow-visible ${
                    recentlyAddedId === assignment.id
                      ? 'bg-green-50 ring-2 ring-green-400 ring-opacity-50 animate-pulse'
                      : ''
                  }`}
                >
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

                            {/* Fee Actions Button */}
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
                                  <span>Remove from {config.title}</span>
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
                      className={`text-xs flex items-center gap-1 ${colors.text} hover:opacity-80`}
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
                          try {
                            // Strapi 5: Direct access to fee object
                            const feeId = assignment.fee?.id;
                            const feeData = assignment.fee;

                            if (!feeId) {
                              throw new Error('Fee ID not found. Please refresh and try again.');
                            }

                            const updatePayload = {
                              name: feeData.name,
                              type: feeData.type?.id || feeData.type,
                              base_amount: feeData.base_amount,
                              frequency: feeData.frequency,
                              calculation_method: feeData.calculation_method || 'flat',
                              currency: feeData.currency || 'INR',
                              installments: installments
                            };

                            const updateResult = await feeService.updateFeeDefinition(feeId, updatePayload);
                            if (!updateResult.success) throw new Error(updateResult.error);
                            const result = updateResult.data;
                            alert('Installments saved successfully!');
                            await loadData();
                          } catch (error) {
                            console.error('Error updating installments:', error);
                            alert('Failed to save installments. Please check console for details.');
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
            <p className="text-gray-600 font-medium">No fees assigned to this {config.title.toLowerCase()}</p>
            <p className="text-sm text-gray-500 mt-1">Click "Add Fee" to get started</p>
          </div>
        )}
      </div>

      {/* Summary Card */}
      {assignments.length > 0 && (
        <div className={`bg-gradient-to-r rounded-lg p-6 border ${colors.gradient}`}>
          <h3 className="font-semibold text-gray-800 mb-4">Fee Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Total Annual Fees</p>
              <p className={`text-2xl font-bold text-green-600`}>₹{totalFees.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Number of Fees</p>
              <p className={`text-2xl font-bold ${colors.text}`}>{assignments.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Fee Categories</p>
              <p className={`text-2xl font-bold ${entityType === 'busStop' ? 'text-indigo-600' : 'text-purple-600'}`}>{Object.keys(groupedAssignments).length}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // If modal mode (onClose provided), wrap in modal container
  if (onClose) {
    // Determine gradient colors based on entity type
    const getModalGradient = () => {
      if (entityType === 'busStop') {
        return 'from-green-600 to-teal-600';
      }
      return 'from-blue-600 to-indigo-600';
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
          {/* Unified modal header for all entity types */}
          <div className={`bg-gradient-to-r ${getModalGradient()} text-white p-6`}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Icon className="w-6 h-6" />
                  Fee Structure for {entityName}
                </h2>
                <p className="text-white/90 mt-1">
                  Total Annual Fees: <span className="font-bold">₹{totalFees.toLocaleString()}</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAddFee(!showAddFee)}
                  className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 flex items-center gap-2 transition-colors"
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
          <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 120px)' }}>
            {content}
          </div>
        </div>
      </div>
    );
  }

  return content;
};

export default UnifiedFeeManager;