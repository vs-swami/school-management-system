import React from 'react';

const emptyRow = (index = 1) => ({ label: `Inst ${index}`, amount: '', due_date: '', index });

export default function FeeInstallmentsEditor({ value = [], onChange }) {
  const rows = Array.isArray(value) ? value : [];

  const updateRow = (i, patch) => {
    const next = rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r));
    onChange?.(next);
  };

  const addRow = () => onChange?.([...(rows || []), emptyRow((rows?.length || 0) + 1)]);
  const removeRow = (i) => onChange?.(rows.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-12 gap-2 text-sm font-medium text-gray-600">
        <div className="col-span-4">Label</div>
        <div className="col-span-3">Amount</div>
        <div className="col-span-4">Due Date</div>
        <div className="col-span-1" />
      </div>
      {rows.map((r, i) => (
        <div key={i} className="grid grid-cols-12 gap-2 items-center">
          <input className="col-span-4 border rounded px-2 py-1" value={r.label || ''}
                 onChange={(e) => updateRow(i, { label: e.target.value })} />
          <input className="col-span-3 border rounded px-2 py-1" type="number" value={r.amount}
                 onChange={(e) => updateRow(i, { amount: e.target.value })} />
          <input className="col-span-4 border rounded px-2 py-1" type="date" value={r.due_date || ''}
                 onChange={(e) => updateRow(i, { due_date: e.target.value })} />
          <button type="button" className="col-span-1 text-red-600" onClick={() => removeRow(i)}>✕</button>
        </div>
      ))}
      <div>
        <button type="button" className="px-3 py-1 border rounded" onClick={addRow}>+ Add installment</button>
      </div>
    </div>
  );
}

