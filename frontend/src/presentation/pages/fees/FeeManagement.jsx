import React, { useEffect, useState } from 'react';
import { useClassStore } from '../../../application/stores/useClassStore';
import { School, DollarSign } from 'lucide-react';
import ClassFeeManager from '../../components/fees/ClassFeeManager';

const FeeManagement = () => {
  const { classes, fetchClasses } = useClassStore();
  const [selectedClassId, setSelectedClassId] = useState('');

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const sortedClasses = [...classes].sort((a, b) => {
    const nameA = a.classname || '';
    const nameB = b.classname || '';
    return nameA.localeCompare(nameB, undefined, { numeric: true });
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-green-600" />
            Fee Management
          </h1>
          <p className="text-gray-600 mt-2">Fees are now managed via Fee Definitions and Assignments. Select a class to manage its fees.</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Select Class</label>
              <select className="w-full border rounded px-3 py-2" value={selectedClassId}
                      onChange={(e) => setSelectedClassId(e.target.value)}>
                <option value="">— Choose a class —</option>
                {sortedClasses.map((cls) => (
                  <option key={cls.id} value={cls.id}>{cls.classname}</option>
                ))}
              </select>
            </div>
            <div className="text-gray-500 flex items-center gap-2">
              <School className="w-5 h-5" /> {classes.length} classes loaded
            </div>
          </div>
        </div>

        {selectedClassId ? (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <ClassFeeManager
              classId={parseInt(selectedClassId)}
              className={sortedClasses.find(c => c.id === parseInt(selectedClassId))?.classname || 'Class'}
            />
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-500 border border-gray-200">
            Select a class to view and manage its fee assignments.
          </div>
        )}
      </div>
    </div>
  );
};

export default FeeManagement;

