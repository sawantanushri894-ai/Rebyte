import React, { useState } from 'react';
import { X, Recycle, Sparkles } from 'lucide-react';

export default function DonationModal({ isOpen, onClose, currentUser, authToken, onNotify }) {
  const [componentName, setComponentName] = useState('');
  const [category, setCategory] = useState('Microcontrollers');
  const [weightKg, setWeightKg] = useState('0.3');
  const [condition, setCondition] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      onNotify?.({ type: 'warning', title: 'Sign In Required', message: 'Please sign in to log a donation' });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/donations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authToken ? `Bearer ${authToken}` : 'Bearer student-mock-token'
        },
        body: JSON.stringify({
          component_name: componentName,
          category,
          estimated_weight_kg: parseFloat(weightKg || 0.25),
          condition_description: condition
        })
      });

      const json = await res.json();
      if (json.success) {
        onNotify?.({
          type: 'success',
          title: 'Donation Logged',
          message: 'E-Waste recorded! Drop off hardware at Lab 302 Green Shelf.'
        });
        onClose();
      }
    } catch (err) {
      onNotify?.({ type: 'error', title: 'Error', message: 'Failed to submit donation' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="corporate-card rounded-2xl max-w-md w-full p-7 border border-hairline shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 border-b border-hairline mb-5">
          <h3 className="font-bold text-slate-100 flex items-center gap-2 text-base">
            <Recycle className="w-5 h-5 text-[#34d399]" />
            Donate Scrap & E-Waste (Campus Circularity)
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 mb-1 font-medium">Salvaged Component / Board Name:</label>
            <input
              type="text"
              required
              value={componentName}
              onChange={(e) => setComponentName(e.target.value)}
              placeholder="e.g. Blown Arduino Mega 2560 / 12V 2A SMPS"
              className="corporate-input w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-slate-300 mb-1 font-medium">Category:</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="corporate-input w-full"
              >
                <option value="Microcontrollers">Microcontrollers</option>
                <option value="Sensors">Sensors</option>
                <option value="Actuators">Actuators</option>
                <option value="Tools & Passives">Tools & Passives</option>
                <option value="E-Waste Refurbished">E-Waste Refurbished</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 mb-1 font-medium">Est. Weight (kg):</label>
              <input
                type="number"
                step="0.05"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                className="corporate-input w-full tabular-nums font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-medium">Condition & Failure Notes:</label>
            <textarea
              rows={3}
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              placeholder="e.g. Diode D1 blown, USB port functional, headers intact."
              className="corporate-input w-full leading-relaxed"
            />
          </div>

          <div className="bg-[#0f1420] p-3.5 rounded-xl border border-hairline text-xs text-[#34d399] font-mono flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 flex-shrink-0" />
            <span>Eligible for VIVA ECE Green Club activity points & circularity credits!</span>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 rounded-xl btn-primary text-xs font-semibold uppercase tracking-wider"
            >
              {submitting ? 'Logging...' : 'Submit E-Waste Donation'}
            </button>
            <button type="button" onClick={onClose} className="py-3 px-5 rounded-xl btn-secondary text-xs">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
