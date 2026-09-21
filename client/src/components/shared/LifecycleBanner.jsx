import React from 'react';
import {
  UserPlus,
  ShieldCheck,
  Search,
  ShoppingCart,
  CreditCard,
  QrCode,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';

export default function LifecycleBanner({ onSelectStep, activeStep = 3 }) {
  const steps = [
    { num: 1, label: '1. Register', desc: 'College ID & OTP', icon: UserPlus, highlight: 'pending_verification' },
    { num: 2, label: '2. Verify', desc: 'Admin ID Check', icon: ShieldCheck, highlight: 'verified' },
    { num: 3, label: '3. Browse', desc: 'Hardware Catalog', icon: Search, highlight: 'filter & search' },
    { num: 4, label: '4. Request', desc: 'Mixed Basket Cart', icon: ShoppingCart, highlight: 'daily rate * days' },
    { num: 5, label: '5. Payment', desc: 'UPI / Offline Token', icon: CreditCard, highlight: 'RNT-*-###' },
    { num: 6, label: '6. Collect', desc: 'Lab Sign-Off & Track', icon: QrCode, highlight: 'COLLECTED state' },
    { num: 7, label: '7. Return', desc: 'Inspect & Restock', icon: RefreshCw, highlight: 'deposit refund' },
  ];

  return (
    <div className="bg-[#0f1420] border-b border-hairline py-5 px-6 sm:px-8 overflow-x-auto scrollbar-none">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3.5">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400 font-semibold">
              ReByte 7-Step Lifecycle State Machine
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            Mumbai University • VIVA ECE Department Workflow
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
          {steps.map((s) => {
            const Icon = s.icon;
            const isCurrent = activeStep === s.num;
            return (
              <div
                key={s.num}
                onClick={() => onSelectStep?.(s.num)}
                className={`cursor-pointer rounded-xl p-3.5 border transition-all duration-200 ${
                  isCurrent
                    ? 'bg-[#1e293b] border-[#38bdf8] shadow-clean-sm'
                    : 'bg-[#151b28] border-hairline hover:border-slate-600 hover:bg-[#1c2436]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-mono font-bold tracking-wider ${isCurrent ? 'text-[#38bdf8]' : 'text-slate-400'}`}>
                    STEP 0{s.num}
                  </span>
                  <Icon className={`w-4 h-4 ${isCurrent ? 'text-[#38bdf8]' : 'text-slate-400'}`} />
                </div>
                <div className="font-semibold text-xs text-slate-100 truncate mb-0.5">{s.label}</div>
                <div className="text-[11px] text-slate-400 truncate mb-1.5">{s.desc}</div>
                <div className="font-mono text-[10px] text-[#34d399] truncate font-medium">
                  {s.highlight}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
