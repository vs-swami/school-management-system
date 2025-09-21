import React, { useEffect, useState } from 'react';
import FeeInstallmentsEditor from './FeeInstallmentsEditor';
import { useFeeTypeService, useFeeService } from '../../../application/hooks/useServices';

export default function FeeDefinitionForm({ initial = null, onSaved, onCancel }) {
  const feeTypeService = useFeeTypeService();
  const feeService = useFeeService();
  const [types, setTypes] = useState([]);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState(() => initial || {
    name: '',
    type: null,
    base_amount: '',
    currency: 'INR',
    frequency: 'term',
    calculation_method: 'flat',
    installments: [],
  });

  useEffect(() => {
    feeTypeService.findAll({ sort: ['name:asc'] }).then(result => {
      if (result.success) setTypes(result.data);
    }).catch(() => setTypes([]));
  }, []);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        type: form.type?.id || form.type, // accept object or id
        base_amount: Number(form.base_amount || 0),
        currency: form.currency,
        frequency: form.frequency,
        calculation_method: form.calculation_method,
        installments: (form.installments || []).map((i, idx) => ({
          label: i.label || `Inst ${idx + 1}`,
          amount: Number(i.amount || 0),
          due_date: i.due_date || null,
          index: i.index || idx + 1,
        })),
      };
      const result = initial?.id
        ? await feeService.updateDefinition(initial.id, payload)
        : await feeService.createDefinition(payload);
      if (result.success) {
        onSaved?.(result.data);
      }
    } catch (e) {
      console.error('FeeDefinition save error', e);
    } finally {
      setSaving(false);
    }
  };

  const presets = {
    yearly: [{ label: 'Yearly', amount: form.base_amount, due_date: '', index: 1 }],
    term2: [
      { label: 'Term 1', amount: (form.base_amount || 0) / 2, due_date: '', index: 1 },
      { label: 'Term 2', amount: (form.base_amount || 0) / 2, due_date: '', index: 2 },
    ],
    monthly10: Array.from({ length: 10 }).map((_, i) => ({ label: `M${i + 1}`, amount: (form.base_amount || 0) / 10, due_date: '', index: i + 1 })),
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Name</label>
          <input className="w-full border rounded px-2 py-1" value={form.name}
                 onChange={(e) => set({ name: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Type</label>
          <select className="w-full border rounded px-2 py-1"
                  value={form.type?.id || form.type || ''}
                  onChange={(e) => set({ type: e.target.value })}>
            <option value="">Select type</option>
            {types.map((t) => (
              <option key={t.id} value={t.id}>{t.name} ({t.code})</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Base Amount</label>
          <input type="number" className="w-full border rounded px-2 py-1" value={form.base_amount}
                 onChange={(e) => set({ base_amount: Number(e.target.value || 0) })} />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Frequency</label>
          <select className="w-full border rounded px-2 py-1" value={form.frequency}
                  onChange={(e) => set({ frequency: e.target.value })}>
            <option value="yearly">Yearly</option>
            <option value="term">Term</option>
            <option value="monthly">Monthly</option>
            <option value="one_time">One time</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-600">Quick presets:</span>
        <button type="button" className="px-2 py-1 border rounded" onClick={() => set({ installments: presets.yearly })}>Yearly</button>
        <button type="button" className="px-2 py-1 border rounded" onClick={() => set({ installments: presets.term2 })}>2 Terms</button>
        <button type="button" className="px-2 py-1 border rounded" onClick={() => set({ installments: presets.monthly10 })}>10 Months</button>
      </div>

      <div>
        <label className="block text-sm text-gray-600 mb-1">Installments</label>
        <FeeInstallmentsEditor value={form.installments} onChange={(v) => set({ installments: v })} />
      </div>

      <div className="flex gap-2 justify-end">
        <button type="button" className="px-3 py-1 border rounded" onClick={onCancel}>Cancel</button>
        <button type="button" disabled={saving} className="px-3 py-1 bg-blue-600 text-white rounded" onClick={handleSave}>
          {saving ? 'Saving…' : 'Save Fee Definition'}
        </button>
      </div>
    </div>
  );
}

