import React, { useState, useEffect } from 'react';
import { X, Plus, Edit2, Trash2, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

const DivisionManagementModal = ({ isOpen, onClose, selectedClass, divisionService }) => {
  const [divisions, setDivisions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newDivisionName, setNewDivisionName] = useState('');
  const [newDivisionLimit, setNewDivisionLimit] = useState(30);
  const [editingDivision, setEditingDivision] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [editingLimit, setEditingLimit] = useState(30);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(null);

  useEffect(() => {
    if (isOpen && selectedClass) {
      fetchDivisions();
    }
  }, [isOpen, selectedClass]);

  const fetchDivisions = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await divisionService.getDivisionsByClass(selectedClass.id);
      if (result.success) {
        setDivisions(result.data);
      } else {
        setError(result.error || 'Failed to fetch divisions');
      }
    } catch (err) {
      setError('Failed to fetch divisions');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDivision = async () => {
    if (!newDivisionName.trim()) {
      setError('Division name is required');
      return;
    }

    setIsCreating(true);
    setError('');
    setSuccess('');

    try {
      const result = await divisionService.createDivision({
        name: newDivisionName.trim(),
        class: selectedClass.id,
        student_limit: newDivisionLimit
      });

      if (result.success) {
        setSuccess(`Division "${newDivisionName}" created successfully`);
        setNewDivisionName('');
        setNewDivisionLimit(30);
        await fetchDivisions();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        if (result.error?.includes('already in use')) {
          setError(`Division name "${newDivisionName}" is already in use by another class. Division names must be unique across all classes.`);
        } else {
          setError(result.error || 'Failed to create division');
        }
      }
    } catch (err) {
      setError('Failed to create division');
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateDivision = async (divisionId) => {
    if (!editingName.trim()) {
      setError('Division name is required');
      return;
    }

    setError('');
    setSuccess('');

    try {
      const result = await divisionService.updateDivision(divisionId, {
        name: editingName.trim(),
        class: selectedClass.id,
        student_limit: editingLimit
      });

      if (result.success) {
        setSuccess(`Division updated successfully`);
        setEditingDivision(null);
        setEditingName('');
        await fetchDivisions();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        if (result.error?.includes('already in use')) {
          setError(`Division name "${editingName}" is already in use by another class. Division names must be unique across all classes.`);
        } else {
          setError(result.error || 'Failed to update division');
        }
      }
    } catch (err) {
      setError('Failed to update division');
    }
  };

  const handleDeleteDivision = async (divisionId) => {
    setIsDeleting(divisionId);
    setError('');
    setSuccess('');

    try {
      const result = await divisionService.deleteDivision(divisionId);

      if (result.success) {
        setSuccess('Division deleted successfully');
        await fetchDivisions();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.error || 'Failed to delete division');
      }
    } catch (err) {
      setError('Failed to delete division');
    } finally {
      setIsDeleting(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Manage Divisions</h2>
              <p className="text-sm text-gray-600 mt-1">
                {selectedClass?.name || 'Class'} Divisions
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(80vh-200px)]">
          {/* Error and Success Messages */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">Error</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-700">{success}</p>
            </div>
          )}

          {/* Create New Division */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Create New Division</h3>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Enter division name (e.g., 1A, 2B)"
                value={newDivisionName}
                onChange={(e) => setNewDivisionName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCreateDivision()}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isCreating}
              />
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Limit:</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={newDivisionLimit}
                  onChange={(e) => setNewDivisionLimit(parseInt(e.target.value) || 30)}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isCreating}
                />
              </div>
              <button
                onClick={handleCreateDivision}
                disabled={isCreating || !newDivisionName.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Create
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              Note: Division names must be unique across all classes in the school
            </p>
          </div>

          {/* Existing Divisions List */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Existing Divisions ({divisions.length})
            </h3>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : divisions.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-600">No divisions found for this class</p>
                <p className="text-sm text-gray-500 mt-1">Create a new division to get started</p>
              </div>
            ) : (
              <div className="space-y-2">
                {divisions.map((division) => (
                  <div
                    key={division.id}
                    className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
                  >
                    {editingDivision === division.id ? (
                      <>
                        <div className="flex-1 flex gap-2">
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') handleUpdateDivision(division.id);
                              if (e.key === 'Escape') {
                                setEditingDivision(null);
                                setEditingName('');
                              }
                            }}
                            className="flex-1 px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                          />
                          <input
                            type="number"
                            min="1"
                            max="100"
                            value={editingLimit}
                            onChange={(e) => setEditingLimit(parseInt(e.target.value) || 30)}
                            className="w-20 px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Limit"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdateDivision(division.id)}
                            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingDivision(null);
                              setEditingName('');
                              setError('');
                            }}
                            className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-gray-800">{division.name}</span>
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                            Limit: {division.student_limit || 30}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${
                            (division.enrollments_count || 0) > (division.student_limit || 30)
                              ? 'bg-red-100 text-red-700'
                              : (division.enrollments_count || 0) === (division.student_limit || 30)
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {division.enrollments_count || 0}/{division.student_limit || 30} students
                            {(division.enrollments_count || 0) > (division.student_limit || 30) &&
                              <AlertCircle className="w-3 h-3" />
                            }
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingDivision(division.id);
                              setEditingName(division.name);
                              setEditingLimit(division.student_limit || 30);
                              setError('');
                            }}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Edit division"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to delete division "${division.name}"?`)) {
                                handleDeleteDivision(division.id);
                              }
                            }}
                            disabled={isDeleting === division.id || division.enrollments_count > 0}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title={division.enrollments_count > 0 ? 'Cannot delete division with students' : 'Delete division'}
                          >
                            {isDeleting === division.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t bg-gray-50">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DivisionManagementModal;