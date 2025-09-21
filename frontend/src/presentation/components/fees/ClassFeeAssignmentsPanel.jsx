import React, { useEffect, useMemo, useState } from 'react';
import { useFeeService } from '../../../application/hooks/useServices';
import FeeDefinitionForm from './FeeDefinitionForm';

export default function ClassFeeAssignmentsPanel({ classId }) {
  const feeService = useFeeService();
  const [assignments, setAssignments] = useState([]);
  const [definitions, setDefinitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Add-assignment state
  const [showCreateDefinition, setShowCreateDefinition] = useState(false);
  const [newAssignment, setNewAssignment] = useState({ fee: '', start_date: '', end_date: '', priority: 10 });
  const setNA = (patch) => setNewAssignment((s) => ({ ...s, ...patch }));

  const totalByType = useMemo(() => {
    const totals = {};
    assignments.forEach(a => {
      const type = a.fee?.type?.code || a.fee?.type?.name || 'FEE';
      const sum = Array.isArray(a.fee?.installments) && a.fee.installments.length > 0
        ? a.fee.installments.reduce((acc, i) => acc + Number(i.amount || 0), 0)
        : Number(a.fee?.base_amount || 0);
      totals[type] = (totals[type] || 0) + sum;
    });
    return totals;
  }, [assignments]);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const [asResult, defsResult] = await Promise.all([
        feeService.findAssignmentsByClass(classId),
        feeService.findAllDefinitions(),
      ]);
      setAssignments(asResult.data || []);
      setDefinitions(defsResult.data || []);
    } catch (e) {
      setError(e?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (classId) refresh(); }, [classId]);

  const handleCreateAssignment = async () => {
    try {
      const payload = {
        fee: Number(newAssignment.fee),
        class: Number(classId),
        start_date: newAssignment.start_date || null,
        end_date: newAssignment.end_date || null,
        priority: Number(newAssignment.priority || 10),
      };
      await feeService.createAssignment(payload);
      setNewAssignment({ fee: '', start_date: '', end_date: '', priority: 10 });
      await refresh();
    } catch (e) {
      console.error('Create assignment failed', e);
    }
  };

  const handleDeleteAssignment = async (id) => {
    if (!window.confirm('Remove this fee assignment from class?')) return;
    await feeService.deleteAssignment(id);
    await refresh();
  };

  if (!classId) return <div className="text-gray-500">Select a class to manage fees.</div>;
  if (loading) return <div>Loading class fees…</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Class Fee Assignments</h3>
        <div className="text-sm text-gray-600 space-x-2">
          {Object.entries(totalByType).map(([k, v]) => (
            <span key={k} className="inline-block bg-gray-100 px-2 py-1 rounded">{k}: {v}</span>
          ))}
        </div>
      </div>

      <div className="border rounded p-3">
        <div className="grid grid-cols-12 gap-2 items-end">
          <div className="col-span-5">
            <label className="block text-sm text-gray-600 mb-1">Fee Definition</label>
            <select className="w-full border rounded px-2 py-1" value={newAssignment.fee}
                    onChange={(e) => setNA({ fee: e.target.value })}>
              <option value="">Select fee…</option>
              {definitions.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} • {d.type?.code || d.type?.name} • {d.frequency}
                </option>
              ))}
            </select>
            <button type="button" className="mt-2 text-blue-600" onClick={() => setShowCreateDefinition(true)}>
              + Create new fee definition
            </button>
          </div>
          <div className="col-span-2">
            <label className="block text-sm text-gray-600 mb-1">Priority</label>
            <input type="number" className="w-full border rounded px-2 py-1" value={newAssignment.priority}
                   onChange={(e) => setNA({ priority: e.target.value })} />
          </div>
          <div className="col-span-2">
            <label className="block text-sm text-gray-600 mb-1">Start</label>
            <input type="date" className="w-full border rounded px-2 py-1" value={newAssignment.start_date}
                   onChange={(e) => setNA({ start_date: e.target.value })} />
          </div>
          <div className="col-span-2">
            <label className="block text-sm text-gray-600 mb-1">End</label>
            <input type="date" className="w-full border rounded px-2 py-1" value={newAssignment.end_date}
                   onChange={(e) => setNA({ end_date: e.target.value })} />
          </div>
          <div className="col-span-1">
            <button type="button" className="w-full bg-blue-600 text-white px-3 py-2 rounded" onClick={handleCreateAssignment} disabled={!newAssignment.fee}>
              Add
            </button>
          </div>
        </div>

        {showCreateDefinition && (
          <div className="mt-4 border-t pt-4">
            <FeeDefinitionForm onSaved={(def) => { setShowCreateDefinition(false); setDefinitions((defs) => [def, ...defs]); setNA({ fee: def.id }); }} onCancel={() => setShowCreateDefinition(false)} />
          </div>
        )}
      </div>

      <div>
        <table className="w-full text-sm border">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-2 border">Type</th>
              <th className="text-left p-2 border">Name</th>
              <th className="text-left p-2 border">Schedule</th>
              <th className="text-left p-2 border">Dates</th>
              <th className="text-left p-2 border">Priority</th>
              <th className="p-2 border" />
            </tr>
          </thead>
          <tbody>
            {assignments.map((a) => (
              <tr key={a.id}>
                <td className="p-2 border align-top">{a.fee?.type?.code || a.fee?.type?.name}</td>
                <td className="p-2 border align-top">{a.fee?.name}</td>
                <td className="p-2 border align-top">
                  {Array.isArray(a.fee?.installments) && a.fee.installments.length > 0 ? (
                    <div className="space-x-1 space-y-1">
                      {a.fee.installments.map((i, idx) => (
                        <span key={idx} className="inline-block bg-gray-100 px-2 py-0.5 rounded">
                          {i.label}: {i.amount}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span>{a.fee?.frequency} • {a.fee?.base_amount}</span>
                  )}
                </td>
                <td className="p-2 border align-top">{a.start_date || '—'} → {a.end_date || '—'}</td>
                <td className="p-2 border align-top">{a.priority}</td>
                <td className="p-2 border align-top text-right">
                  <button className="text-red-600" onClick={() => handleDeleteAssignment(a.id)}>Remove</button>
                </td>
              </tr>
            ))}
            {assignments.length === 0 && (
              <tr><td colSpan={6} className="p-4 text-center text-gray-500">No fees assigned to this class yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

