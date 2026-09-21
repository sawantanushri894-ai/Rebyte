import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Clock,
  CheckCircle2,
  FolderGit2,
  Recycle,
  Copy,
  Check
} from 'lucide-react';

export default function StudentAccountDrawer({
  isOpen,
  onClose,
  currentUser,
  authToken,
  onOpenDonation,
  onOpenProject
}) {
  const [rentals, setRentals] = useState([]);
  const [projects, setProjects] = useState([]);
  const [donations, setDonations] = useState([]);
  const [activeSubTab, setActiveSubTab] = useState('rentals');
  const [copiedToken, setCopiedToken] = useState(null);

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: authToken ? `Bearer ${authToken}` : 'Bearer student-mock-token'
  };

  useEffect(() => {
    if (isOpen && currentUser) {
      loadUserData();
    }
  }, [isOpen, currentUser]);

  const loadUserData = async () => {
    try {
      const [rRes, pRes, dRes] = await Promise.all([
        fetch('/api/rentals/my', { headers: authHeaders }),
        fetch('/api/projects/my', { headers: authHeaders }),
        fetch('/api/donations/my', { headers: authHeaders })
      ]);

      const [rJson, pJson, dJson] = await Promise.all([
        rRes.json(),
        pRes.json(),
        dRes.json()
      ]);

      if (rJson.success) setRentals(rJson.data);
      if (pJson.success) setProjects(pJson.data);
      if (dJson.success) setDonations(dJson.data);
    } catch (err) {
      console.error('Error fetching student account data:', err);
    }
  };

  const copyToken = (tok) => {
    navigator.clipboard?.writeText(tok);
    setCopiedToken(tok);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const activeRentals = rentals.filter(r => r.status === 'COLLECTED');
  const pendingCollection = rentals.filter(r => r.status === 'APPROVED');
  const returnedRentals = rentals.filter(r => r.status === 'RETURNED');

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: "tween", duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "tween", duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
              className="w-screen max-w-lg bg-[#0f1420] border-l border-hairline shadow-2xl flex flex-col justify-between"
            >
              {/* Header */}
              <div className="p-6 border-b border-hairline bg-[#0b0f17] flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-full bg-[#1e293b] border border-hairline flex items-center justify-center font-mono font-bold text-[#38bdf8] text-sm">
                    {currentUser?.name?.[0] || 'A'}
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-100">{currentUser?.name}</h2>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      {currentUser?.college_id} • {currentUser?.department}
                    </p>
                  </div>
                </div>

                <button onClick={onClose} className="p-2 rounded-lg btn-secondary text-slate-400 hover:text-slate-100">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Sub-tab Navigation */}
              <div className="border-b border-hairline bg-[#0b0f17] px-6 flex gap-3">
                <button
                  onClick={() => setActiveSubTab('rentals')}
                  className={`py-3 px-3.5 text-xs font-mono border-b-2 transition-all ${
                    activeSubTab === 'rentals'
                      ? 'border-[#38bdf8] text-[#38bdf8] font-bold'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Active Rentals ({activeRentals.length})
                </button>
                <button
                  onClick={() => setActiveSubTab('projects')}
                  className={`py-3 px-3.5 text-xs font-mono border-b-2 transition-all ${
                    activeSubTab === 'projects'
                      ? 'border-[#38bdf8] text-[#38bdf8] font-bold'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Mini Projects ({projects.length})
                </button>
                <button
                  onClick={() => setActiveSubTab('donations')}
                  className={`py-3 px-3.5 text-xs font-mono border-b-2 transition-all ${
                    activeSubTab === 'donations'
                      ? 'border-[#38bdf8] text-[#38bdf8] font-bold'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  E-Waste ({donations.length})
                </button>
              </div>

              {/* Drawer Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {activeSubTab === 'rentals' && (
                  <div className="space-y-5">
                    {/* Live Tracker Banner for Step 6 */}
                    {activeRentals.length > 0 && (
                      <div className="corporate-card rounded-2xl p-5 border border-[#10b981]/30 space-y-3.5">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-[#34d399] font-semibold flex items-center gap-2">
                            <Clock className="w-4 h-4 animate-spin" />
                            Live Hardware Due-Date Tracker
                          </span>
                          <span className="status-pill-success px-2.5 py-0.5 rounded-full text-[10px] uppercase font-semibold">
                            Step 6 Active
                          </span>
                        </div>

                        {activeRentals.map((r) => (
                          <div key={r.id} className="bg-[#0b0f17] p-4 rounded-xl border border-hairline space-y-1.5 text-xs">
                            <div className="flex justify-between font-bold text-slate-100">
                              <span>{r.item_name}</span>
                              <span className={`font-mono tabular-nums ${r.is_overdue ? 'text-[#fb7185]' : 'text-[#34d399]'}`}>
                                {r.human_remaining || 'Due in 4 days'}
                              </span>
                            </div>
                            <div className="flex justify-between text-xs font-mono text-slate-400">
                              <span>Token: {r.pickup_token}</span>
                              <span>Due: {new Date(r.due_date).toLocaleDateString('en-IN')}</span>
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono pt-1.5 border-t border-hairline">
                              Security Deposit Held: ₹{r.security_deposit} • Sign-off: {r.counter_officer || 'Lab Admin'}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Pending Counter Collection Items */}
                    {pendingCollection.length > 0 && (
                      <div className="space-y-3">
                        <div className="text-xs font-mono text-slate-400 uppercase tracking-wider font-semibold">
                          Awaiting Offline Lab Collection (Step 5 Token)
                        </div>

                        {pendingCollection.map((r) => (
                          <div key={r.id} className="corporate-card rounded-2xl p-5 border border-hairline space-y-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-semibold text-sm text-slate-100">{r.item_name}</h4>
                                <div className="text-xs text-slate-400 font-mono mt-0.5">
                                  {r.duration_days} Days Rental • Fee ₹{r.rental_fee}
                                </div>
                              </div>
                              <span className="status-pill-primary px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-semibold">
                                Ready for Pickup
                              </span>
                            </div>

                            <div className="bg-[#0b0f17] p-3.5 rounded-xl border border-hairline flex items-center justify-between font-mono text-xs">
                              <div>
                                <span className="text-slate-400 text-[10px] block">Show Counter Token:</span>
                                <span className="font-bold text-slate-100 tracking-wider text-sm">{r.pickup_token}</span>
                              </div>
                              <button
                                onClick={() => copyToken(r.pickup_token)}
                                className="p-2 rounded-lg btn-secondary text-xs"
                                title="Copy Token"
                              >
                                {copiedToken === r.pickup_token ? <Check className="w-4 h-4 text-[#34d399]" /> : <Copy className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Completed Returns */}
                    {returnedRentals.length > 0 && (
                      <div className="space-y-3">
                        <div className="text-xs font-mono text-slate-400 uppercase tracking-wider font-semibold">
                          Completed Returns (Step 7 Settled)
                        </div>
                        {returnedRentals.map((r) => (
                          <div key={r.id} className="corporate-card rounded-xl p-4 border border-hairline flex justify-between items-center text-xs">
                            <div>
                              <div className="font-semibold text-slate-100">{r.item_name}</div>
                              <div className="text-xs text-slate-400 font-mono mt-0.5">
                                Condition: {r.condition_on_return} • Refund: ₹{r.refunded_deposit}
                              </div>
                            </div>
                            <span className="status-pill-success px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold">
                              Settled
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {rentals.length === 0 && (
                      <div className="text-center py-16 text-slate-400 text-xs">
                        No active or past rentals found. Browse the catalog to borrow hardware components!
                      </div>
                    )}
                  </div>
                )}

                {/* 2. MINI PROJECTS */}
                {activeSubTab === 'projects' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-mono text-slate-400 uppercase tracking-wider font-semibold">Capstone Proposals</span>
                      <button
                        onClick={onOpenProject}
                        className="py-1.5 px-3.5 rounded-lg btn-primary text-xs font-semibold uppercase"
                      >
                        Submit New
                      </button>
                    </div>

                    {projects.map((p) => (
                      <div key={p.id} className="corporate-card rounded-2xl p-5 border border-hairline space-y-2.5 text-xs">
                        <div className="flex justify-between items-start">
                          <h4 className="font-semibold text-slate-100 text-sm">{p.title}</h4>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-semibold ${
                            p.status === 'APPROVED' ? 'status-pill-success' : 'status-pill-warning'
                          }`}>
                            {p.status}
                          </span>
                        </div>

                        <p className="text-slate-300 text-xs leading-relaxed">{p.abstract}</p>

                        <div className="bg-[#0b0f17] p-3 rounded-xl border border-hairline font-mono text-xs flex justify-between">
                          <span className="text-slate-400">Assigned Guide:</span>
                          <strong className={p.mentor_assigned ? 'text-[#38bdf8]' : 'text-slate-500'}>
                            {p.mentor_assigned || 'Pending Faculty Assignment'}
                          </strong>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 3. E-WASTE DONATIONS */}
                {activeSubTab === 'donations' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-mono text-slate-400 uppercase tracking-wider font-semibold">Donation History</span>
                      <button
                        onClick={onOpenDonation}
                        className="py-1.5 px-3.5 rounded-lg btn-primary text-xs font-semibold uppercase"
                      >
                        Donate Item
                      </button>
                    </div>

                    {donations.map((d) => (
                      <div key={d.id} className="corporate-card rounded-2xl p-5 border border-hairline space-y-2 text-xs">
                        <div className="flex justify-between items-start">
                          <h4 className="font-semibold text-slate-100">{d.component_name}</h4>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-semibold ${
                            d.status === 'RESTOCKED' ? 'status-pill-success' : 'status-pill-warning'
                          }`}>
                            {d.status}
                          </span>
                        </div>
                        <p className="text-slate-400 text-xs leading-relaxed">{d.condition_description}</p>
                        <div className="font-mono text-xs text-[#34d399]">
                          Weight: {d.estimated_weight_kg || 0.25} kg • Notes: {d.evaluation_notes || 'Pending'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-5 border-t border-hairline bg-[#0b0f17] flex justify-between items-center text-xs font-mono text-slate-400">
                <span>VIVA ECE Portal ID: {currentUser?.id}</span>
                <button onClick={onClose} className="px-4 py-2 rounded-lg btn-secondary text-xs">
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
