import React from 'react';
import { ShieldAlert, Lock, ArrowRight, UserCheck } from 'lucide-react';

export default function ForbiddenBarrier({ onSwitchToAdmin, onReturnToCatalog }) {
  return (
    <div className="min-h-[75vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full corporate-card rounded-2xl p-8 border border-hairline shadow-2xl relative overflow-hidden">
        {/* Subtle accent glow */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#f43f5e] to-transparent opacity-60"></div>

        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#f43f5e]/10 border border-[#f43f5e]/20 flex items-center justify-center mb-5 text-[#fb7185]">
            <ShieldAlert className="w-7 h-7" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono status-pill-danger uppercase tracking-wider mb-3.5 font-semibold">
            <Lock className="w-3.5 h-3.5" />
            HTTP 403 Forbidden
          </div>

          <h2 className="text-xl font-bold text-slate-100 tracking-tight mb-2">
            Admin Privileges Required
          </h2>

          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            The ReByte Admin Control Center is restricted to verified faculty lab in-charges (VIVA ECE Department). Your current session lacks elevated administrative role credentials.
          </p>

          <div className="w-full bg-[#0b0f17] border border-hairline rounded-xl p-4 text-left font-mono text-xs text-slate-300 mb-6 space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Target Resource:</span>
              <span className="text-slate-200">/api/admin/*</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Required Role:</span>
              <span className="text-[#38bdf8] font-semibold">admin (Faculty In-Charge)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Access Policy:</span>
              <span className="text-[#34d399]">RBAC JWT Bearer</span>
            </div>
          </div>

          <div className="w-full space-y-3">
            <button
              id="switch-admin-demo-btn"
              onClick={onSwitchToAdmin}
              className="w-full py-3 px-4 rounded-xl btn-primary text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2"
            >
              <UserCheck className="w-4 h-4" />
              Switch to Faculty Admin (Prof. K. Venkatesh)
            </button>

            <button
              onClick={onReturnToCatalog}
              className="w-full py-3 px-4 rounded-xl btn-secondary text-xs font-medium flex items-center justify-center gap-2"
            >
              Return to Student Catalog
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
