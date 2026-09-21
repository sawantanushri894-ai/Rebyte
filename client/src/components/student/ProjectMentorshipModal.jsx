import React, { useState } from 'react';
import { X, FolderGit2, Sparkles } from 'lucide-react';

export default function ProjectMentorshipModal({ isOpen, onClose, currentUser, authToken, onNotify }) {
  const [title, setTitle] = useState('');
  const [domainTags, setDomainTags] = useState('IoT, Robotics, ESP32');
  const [abstract, setAbstract] = useState('');
  const [hardware, setHardware] = useState('ESP32-WROOM-32, HC-SR04, L298N Motor Driver');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      onNotify?.({ type: 'warning', title: 'Sign In Required', message: 'Please sign in to submit a proposal' });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authToken ? `Bearer ${authToken}` : 'Bearer student-mock-token'
        },
        body: JSON.stringify({
          title,
          domain_tags: domainTags.split(',').map(s => s.trim()).filter(Boolean),
          abstract,
          hardware_requested: hardware.split(',').map(s => s.trim()).filter(Boolean)
        })
      });

      const json = await res.json();
      if (json.success) {
        onNotify?.({
          type: 'success',
          title: 'Proposal Submitted',
          message: 'Faculty mentor review initiated. Check back in your Student Account!'
        });
        onClose();
      }
    } catch (err) {
      onNotify?.({ type: 'error', title: 'Error', message: 'Failed to submit proposal' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="corporate-card rounded-2xl max-w-lg w-full p-7 border border-hairline shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 border-b border-hairline mb-5">
          <h3 className="font-bold text-slate-100 flex items-center gap-2 text-base">
            <FolderGit2 className="w-5 h-5 text-[#38bdf8]" />
            Submit Capstone / Mini-Project Proposal
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 mb-1 font-medium">Project Title:</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Quadcopter Autonomous Flight Controller via STM32"
              className="corporate-input w-full"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-medium">Domain Tags (comma-separated):</label>
            <input
              type="text"
              value={domainTags}
              onChange={(e) => setDomainTags(e.target.value)}
              placeholder="IoT, Robotics, AI, Embedded Systems, LoRa"
              className="corporate-input w-full font-mono text-xs"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-medium">Technical Abstract / Problem Statement:</label>
            <textarea
              rows={4}
              required
              value={abstract}
              onChange={(e) => setAbstract(e.target.value)}
              placeholder="Describe the objective, sensor interfacing, algorithms, and semester syllabus tie-in..."
              className="corporate-input w-full leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-medium">Hardware Components Required:</label>
            <input
              type="text"
              value={hardware}
              onChange={(e) => setHardware(e.target.value)}
              placeholder="e.g. ESP32, MPU-6050, SG90 Servo"
              className="corporate-input w-full font-mono text-xs"
            />
          </div>

          <div className="bg-[#0f1420] p-4 rounded-xl border border-hairline text-xs text-slate-400 space-y-1 font-mono">
            <div className="text-[#38bdf8] font-semibold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> Faculty Mentorship Track
            </div>
            <div className="leading-relaxed">
              Reviewed by Department Project Coordinator (Prof. K. Venkatesh) for Mumbai University ECE Sem IV / VI capstone credit.
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 rounded-xl btn-primary text-xs font-semibold uppercase tracking-wider"
            >
              {submitting ? 'Submitting...' : 'Submit for Faculty Mentorship'}
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
