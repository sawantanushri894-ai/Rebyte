import React from 'react';
import {
  Cpu,
  ShoppingBag,
  Clock,
  Shield,
  Recycle,
  FolderGit2
} from 'lucide-react';

export default function Navbar({
  currentUser,
  currentRole,
  onSwitchRole,
  onOpenCart,
  cartCount,
  onOpenAccount,
  activeRentalsCount,
  onOpenAuth,
  onOpenDonation,
  onOpenProject,
  activeView,
  setActiveView
}) {
  return (
    <header className="border-b border-hairline bg-[#0f1420]/95 sticky top-0 z-30 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 h-18 flex items-center justify-between gap-6">
        {/* Logo & Campus Context */}
        <div 
          className="flex items-center gap-3.5 cursor-pointer select-none" 
          onClick={() => setActiveView('student')}
        >
          <div className="w-10 h-10 rounded-xl bg-[#1e293b] border border-hairline flex items-center justify-center text-[#38bdf8] shadow-clean-sm">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-slate-100">
                Re<span className="text-[#38bdf8]">Byte</span>
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#1e293b] text-slate-300 border border-hairline">
                v2.4 ECE
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-medium">
              VIVA Institute of Technology • Mumbai University
            </div>
          </div>
        </div>

        {/* Center Quick Navigation */}
        <div className="hidden md:flex items-center gap-2 font-medium text-xs">
          <button
            onClick={() => setActiveView('student')}
            className={`px-3.5 py-2 rounded-lg transition-all duration-150 ${
              activeView === 'student'
                ? 'bg-[#1e293b] text-slate-100 border border-hairline shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#151b28]'
            }`}
          >
            Hardware Catalog
          </button>
          <button
            onClick={onOpenDonation}
            className="px-3.5 py-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-[#151b28] transition-all duration-150 flex items-center gap-1.5"
          >
            <Recycle className="w-4 h-4 text-[#10b981]" />
            Donate E-Waste
          </button>
          <button
            onClick={onOpenProject}
            className="px-3.5 py-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-[#151b28] transition-all duration-150 flex items-center gap-1.5"
          >
            <FolderGit2 className="w-4 h-4 text-[#f59e0b]" />
            Mini Project
          </button>
          <button
            onClick={() => setActiveView('admin')}
            className={`px-3.5 py-2 rounded-lg transition-all duration-150 flex items-center gap-1.5 ${
              activeView === 'admin'
                ? 'bg-[#1e293b] text-slate-100 border border-hairline shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#151b28]'
            }`}
          >
            <Shield className="w-4 h-4 text-[#38bdf8]" />
            Admin Control
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Quick Demo Role Switcher Toggle */}
          <div className="flex items-center bg-[#070a10] border border-hairline rounded-lg p-1 text-[11px] font-medium">
            <button
              onClick={() => onSwitchRole('student')}
              className={`px-2.5 py-1 rounded-md transition-all duration-150 ${
                currentRole === 'student'
                  ? 'bg-[#1e293b] text-slate-100 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Student
            </button>
            <button
              onClick={() => onSwitchRole('admin')}
              className={`px-2.5 py-1 rounded-md transition-all duration-150 ${
                currentRole === 'admin'
                  ? 'bg-[#1e293b] text-slate-100 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Faculty Admin
            </button>
          </div>

          {/* Student Account Tracker Button */}
          {currentUser && (
            <button
              onClick={onOpenAccount}
              className="py-2 px-3 rounded-lg btn-secondary text-xs flex items-center gap-2"
              title="Student Rentals & Due-Date Tracker"
            >
              <Clock className="w-4 h-4 text-[#10b981]" />
              <span className="hidden sm:inline font-mono text-[11px]">Due-Date Tracker</span>
              {activeRentalsCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse"></span>
              )}
            </button>
          )}

          {/* Cart Trigger */}
          <button
            onClick={onOpenCart}
            className="py-2 px-3.5 rounded-lg btn-primary text-xs flex items-center gap-2 font-semibold"
            title="View Cart"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">Cart</span>
            {cartCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-white text-[10px] font-mono tabular-nums">
                {cartCount}
              </span>
            )}
          </button>

          {/* User Profile Avatar */}
          {currentUser ? (
            <div
              onClick={onOpenAccount}
              className="w-9 h-9 rounded-full bg-[#1e293b] border border-hairline flex items-center justify-center text-xs font-semibold text-slate-200 cursor-pointer hover:border-slate-400 transition-colors"
              title={`Signed in as ${currentUser.name}`}
            >
              {currentUser.name?.[0] || 'U'}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="py-2 px-3.5 rounded-lg btn-secondary text-xs font-medium"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
