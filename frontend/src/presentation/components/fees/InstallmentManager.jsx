import React, { useState } from 'react';
import {
  Calendar,
  DollarSign,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Clock,
  CheckCircle,
  AlertCircle,
  CreditCard,
  TrendingUp,
  PieChart
} from 'lucide-react';

const InstallmentManager = ({
  fee,
  onUpdate,
  totalAmount,
  frequency = 'yearly',
  currency = '₹'
}) => {
  // Initialize installments from fee data, handling both array and object formats
  const initializeInstallments = () => {
    if (!fee?.installments) return [];

    // If it's already an array, use it
    if (Array.isArray(fee.installments)) {
      return fee.installments;
    }

    // If it's an object with data property (Strapi format)
    if (fee.installments.data && Array.isArray(fee.installments.data)) {
      return fee.installments.data.map(item => item.attributes || item);
    }

    return [];
  };

  const [installments, setInstallments] = useState(initializeInstallments());
  const [editMode, setEditMode] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newInstallment, setNewInstallment] = useState({
    label: '',
    amount: '',
    due_date: '',
    description: ''
  });

  // Calculate total from installments
  const installmentTotal = installments.reduce((sum, inst) => sum + (parseFloat(inst.amount) || 0), 0);
  const remaining = totalAmount - installmentTotal;
  const isBalanced = Math.abs(remaining) < 0.01;

  // Generate default installments based on frequency
  const generateDefaultInstallments = () => {
    const baseAmount = totalAmount || fee?.base_amount || 0;

    let defaultInstallments = [];
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();

    switch (frequency) {
      case 'yearly':
        defaultInstallments = [{
          label: 'Annual Payment',
          amount: baseAmount,
          due_date: new Date(currentYear, currentMonth + 1, 1).toISOString().split('T')[0],
          description: 'Full year payment'
        }];
        break;

      case 'term':
        const termAmount = baseAmount / 2;
        defaultInstallments = [
          {
            label: 'Term 1',
            amount: termAmount,
            due_date: new Date(currentYear, 3, 1).toISOString().split('T')[0], // April
            description: 'First term payment'
          },
          {
            label: 'Term 2',
            amount: termAmount,
            due_date: new Date(currentYear, 9, 1).toISOString().split('T')[0], // October
            description: 'Second term payment'
          }
        ];
        break;

      case 'monthly':
        const monthlyAmount = baseAmount / 12;
        defaultInstallments = Array.from({ length: 12 }, (_, i) => ({
          label: `Month ${i + 1}`,
          amount: monthlyAmount,
          due_date: new Date(currentYear, currentMonth + i, 1).toISOString().split('T')[0],
          description: `Payment for month ${i + 1}`
        }));
        break;

      default:
        defaultInstallments = [{
          label: 'One-time Payment',
          amount: baseAmount,
          due_date: new Date().toISOString().split('T')[0],
          description: 'Single payment'
        }];
    }

    setInstallments(defaultInstallments);
  };

  // Add new installment
  const addInstallment = () => {
    if (newInstallment.label && newInstallment.amount) {
      setInstallments([...installments, {
        ...newInstallment,
        amount: parseFloat(newInstallment.amount)
      }]);
      setNewInstallment({ label: '', amount: '', due_date: '', description: '' });
      setShowAddForm(false);
    }
  };

  // Remove installment
  const removeInstallment = (index) => {
    setInstallments(installments.filter((_, i) => i !== index));
  };

  // Update installment
  const updateInstallment = (index, field, value) => {
    const updated = [...installments];
    updated[index] = {
      ...updated[index],
      [field]: field === 'amount' ? parseFloat(value) || 0 : value
    };
    setInstallments(updated);
  };

  // Auto-balance remaining amount
  const autoBalance = () => {
    if (installments.length === 0) return;

    const perInstallment = remaining / installments.length;
    const balanced = installments.map(inst => ({
      ...inst,
      amount: (parseFloat(inst.amount) || 0) + perInstallment
    }));
    setInstallments(balanced);
  };

  // Save installments
  const saveInstallments = () => {
    console.log('Saving installments:', installments);
    if (onUpdate) {
      // Format installments with proper structure for Strapi
      const formattedInstallments = installments.map((inst, index) => ({
        label: inst.label || `Installment ${index + 1}`,
        amount: parseFloat(inst.amount) || 0,
        due_date: inst.due_date || null,
        index: index
        // Remove description as it's not in the schema
      }));
      console.log('Formatted installments for save:', formattedInstallments);
      onUpdate(formattedInstallments);
    }
    setEditMode(false);
  };

  // Get status color for due date
  const getDueDateStatus = (dueDate) => {
    if (!dueDate) return 'text-gray-500';

    const today = new Date();
    const due = new Date(dueDate);
    const diffDays = Math.floor((due - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'text-red-600'; // Overdue
    if (diffDays <= 7) return 'text-yellow-600'; // Due soon
    if (diffDays <= 30) return 'text-blue-600'; // Coming up
    return 'text-gray-600'; // Future
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Payment Schedule
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Total: {currency}{totalAmount?.toLocaleString() || 0} •
            {installments.length} installment{installments.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex gap-2">
          {!editMode ? (
            <>
              <button
                onClick={generateDefaultInstallments}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                Auto-Generate
              </button>
              <button
                onClick={() => setEditMode(true)}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                <Edit2 className="w-4 h-4 inline mr-1" />
                Edit
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setEditMode(false)}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={saveInstallments}
                className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
              >
                <Save className="w-4 h-4 inline mr-1" />
                Save
              </button>
            </>
          )}
        </div>
      </div>

      {/* Balance Status */}
      {installments.length > 0 && (
        <div className={`p-3 rounded-lg border ${
          isBalanced
            ? 'bg-green-50 border-green-200'
            : 'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isBalanced ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-yellow-600" />
              )}
              <span className={`text-sm font-medium ${
                isBalanced ? 'text-green-700' : 'text-yellow-700'
              }`}>
                {isBalanced
                  ? 'Installments balanced with total amount'
                  : `${currency}${Math.abs(remaining).toLocaleString()} ${remaining > 0 ? 'remaining' : 'excess'}`
                }
              </span>
            </div>
            {!isBalanced && editMode && (
              <button
                onClick={autoBalance}
                className="text-xs px-2 py-1 bg-white rounded border hover:bg-gray-50"
              >
                Auto-Balance
              </button>
            )}
          </div>
        </div>
      )}

      {/* Installments List */}
      <div className="space-y-2">
        {installments.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-600">No installments configured</p>
            <p className="text-sm text-gray-500 mt-1">
              Click "Auto-Generate" to create a default schedule
            </p>
          </div>
        ) : (
          <>
            {/* Timeline View */}
            <div className="relative">
              {installments.map((inst, index) => (
                <div key={index} className="flex gap-4 mb-3">
                  {/* Timeline dot and line */}
                  <div className="relative flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full ${
                      index === 0 ? 'bg-blue-600' : 'bg-gray-400'
                    }`} />
                    {index < installments.length - 1 && (
                      <div className="w-0.5 h-full bg-gray-300 absolute top-3" />
                    )}
                  </div>

                  {/* Installment Card */}
                  <div className="flex-1 bg-white border rounded-lg p-3">
                    {editMode ? (
                      <div className="grid grid-cols-4 gap-2">
                        <input
                          type="text"
                          value={inst.label}
                          onChange={(e) => updateInstallment(index, 'label', e.target.value)}
                          className="px-2 py-1 border rounded text-sm"
                          placeholder="Label"
                        />
                        <input
                          type="number"
                          value={inst.amount}
                          onChange={(e) => updateInstallment(index, 'amount', e.target.value)}
                          className="px-2 py-1 border rounded text-sm"
                          placeholder="Amount"
                        />
                        <input
                          type="date"
                          value={inst.due_date}
                          onChange={(e) => updateInstallment(index, 'due_date', e.target.value)}
                          className="px-2 py-1 border rounded text-sm"
                        />
                        <button
                          onClick={() => removeInstallment(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-800">{inst.label}</p>
                          <p className="text-sm text-gray-600">
                            {currency}{inst.amount?.toLocaleString()}
                          </p>
                          {inst.description && (
                            <p className="text-xs text-gray-500 mt-1">{inst.description}</p>
                          )}
                        </div>
                        <div className="text-right">
                          {inst.due_date && (
                            <p className={`text-sm font-medium ${getDueDateStatus(inst.due_date)}`}>
                              {new Date(inst.due_date).toLocaleDateString()}
                            </p>
                          )}
                          <p className="text-xs text-gray-500">
                            {((inst.amount / totalAmount) * 100).toFixed(0)}% of total
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Add New Installment (Edit Mode Only) */}
            {editMode && (
              <div className="mt-4">
                {showAddForm ? (
                  <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="Installment Label"
                        value={newInstallment.label}
                        onChange={(e) => setNewInstallment({...newInstallment, label: e.target.value})}
                        className="px-2 py-1 border rounded text-sm"
                      />
                      <input
                        type="number"
                        placeholder="Amount"
                        value={newInstallment.amount}
                        onChange={(e) => setNewInstallment({...newInstallment, amount: e.target.value})}
                        className="px-2 py-1 border rounded text-sm"
                      />
                      <input
                        type="date"
                        value={newInstallment.due_date}
                        onChange={(e) => setNewInstallment({...newInstallment, due_date: e.target.value})}
                        className="px-2 py-1 border rounded text-sm"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={addInstallment}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => setShowAddForm(false)}
                        className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700"
                  >
                    <Plus className="w-4 h-4 inline mr-1" />
                    Add Installment
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Visual Summary */}
      {installments.length > 1 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Payment Distribution</h4>
          <div className="space-y-2">
            {installments.map((inst, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="text-xs text-gray-600 w-20">{inst.label}</span>
                <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                  <div
                    className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-end pr-2"
                    style={{ width: `${(inst.amount / totalAmount) * 100}%` }}
                  >
                    <span className="text-xs text-white font-medium">
                      {((inst.amount / totalAmount) * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-700 w-24 text-right">
                  {currency}{inst.amount?.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default InstallmentManager;