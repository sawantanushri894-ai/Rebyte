import React, { useState } from 'react';
import {
  X,
  School,
  Lock,
  Mail,
  User,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onAuthSuccess, onNotify }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [collegeId, setCollegeId] = useState('');
  const [department, setDepartment] = useState('Electronics & Computer Engineering');
  const [year, setYear] = useState('SE - Sem IV');
  const [otpCode, setOtpCode] = useState('');
  const [simulatedOtp, setSimulatedOtp] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleQuickDemoLogin = (role) => {
    if (role === 'admin') {
      setEmail('admin@viva.edu.in');
      setPassword('admin123');
    } else {
      setEmail('anushka.ece@viva.edu.in');
      setPassword('student123');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const json = await res.json();
      if (json.success) {
        onAuthSuccess(json.user, json.token);
        onNotify?.({ type: 'success', title: 'Login Successful', message: `Welcome ${json.user.name}!` });
        onClose();
      } else {
        onNotify?.({ type: 'error', title: 'Login Failed', message: json.message });
      }
    } catch (err) {
      onNotify?.({ type: 'error', title: 'Network Error', message: 'Could not connect to auth server' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          name,
          college_id: collegeId,
          department,
          year
        })
      });
      const json = await res.json();
      if (json.success) {
        setSimulatedOtp(json.data.otp_simulation);
        setMode('otp');
        onNotify?.({
          type: 'success',
          title: 'Step 1 Complete',
          message: `Simulated OTP dispatched to ${email}. Check screen to enter code.`
        });
      } else {
        onNotify?.({ type: 'error', title: 'Registration Failed', message: json.message });
      }
    } catch (err) {
      onNotify?.({ type: 'error', title: 'Error', message: 'Registration failed' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpCode })
      });
      const json = await res.json();
      if (json.success) {
        onNotify?.({
          type: 'success',
          title: 'OTP Validated',
          message: 'Account flagged as pending_verification. An admin will verify your ID (Step 2).'
        });
        setMode('login');
      } else {
        onNotify?.({ type: 'error', title: 'OTP Error', message: json.message });
      }
    } catch (err) {
      onNotify?.({ type: 'error', title: 'Error', message: 'Verification failed' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="corporate-card rounded-2xl max-w-md w-full p-7 border border-hairline shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 border-b border-hairline mb-5">
          <div className="flex items-center gap-2.5">
            <School className="w-5 h-5 text-[#38bdf8]" />
            <h3 className="font-bold text-slate-100 text-base">
              {mode === 'login' ? 'Sign In to ReByte' : mode === 'register' ? 'Register College Account (Step 1)' : 'Verify Simulated OTP'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Demo Autofill Bar */}
        {mode === 'login' && (
          <div className="bg-[#0f1420] p-3.5 rounded-xl border border-hairline mb-5 text-xs space-y-2">
            <div className="text-[10px] uppercase font-mono text-slate-400 font-semibold tracking-wider">Quick Test Credentials:</div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('student')}
                className="flex-1 py-1.5 px-2.5 rounded-lg btn-secondary text-xs font-mono text-left truncate"
              >
                🎓 Student (Anushka)
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('admin')}
                className="flex-1 py-1.5 px-2.5 rounded-lg btn-secondary text-xs font-mono text-left truncate"
              >
                🛡️ Faculty (Prof. Venkatesh)
              </button>
            </div>
          </div>
        )}

        {/* Mode: Login */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 mb-1 font-medium">College Email Address:</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name.ece@viva.edu.in"
                className="corporate-input w-full font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-medium">Password:</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="corporate-input w-full font-mono text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl btn-primary text-xs font-semibold uppercase tracking-wider mt-2"
            >
              {submitting ? 'Authenticating...' : 'Sign In'}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setMode('register')}
                className="text-xs text-[#38bdf8] hover:underline font-medium"
              >
                New Student? Register with College ID (Step 1)
              </button>
            </div>
          </form>
        )}

        {/* Mode: Register */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-300 mb-1 font-medium">Full Student Name:</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Aditya Kadam"
                className="corporate-input w-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">College Email:</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="aditya.ece@viva.edu.in"
                  className="corporate-input w-full font-mono text-[11px]"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1 font-medium">College ID No.:</label>
                <input
                  type="text"
                  required
                  value={collegeId}
                  onChange={(e) => setCollegeId(e.target.value)}
                  placeholder="VIVA-ECE-2024-077"
                  className="corporate-input w-full font-mono text-[11px]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Department:</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="corporate-input w-full text-xs"
                >
                  <option value="Electronics & Computer Engineering">ECE</option>
                  <option value="Electronics & Telecomm">EXTC</option>
                  <option value="Computer Engineering">CMPN</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Year / Semester:</label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="corporate-input w-full text-xs"
                >
                  <option value="SE - Sem IV">SE - Sem IV</option>
                  <option value="TE - Sem VI">TE - Sem VI</option>
                  <option value="BE - Sem VIII">BE - Sem VIII</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-medium">Set Password:</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="corporate-input w-full font-mono"
              />
            </div>

            <div className="bg-[#0f1420] p-3 rounded-xl border border-hairline text-xs text-slate-400 font-mono">
              Requires authorized college domain (@viva.edu.in, @mu.ac.in). Flags account as pending_verification.
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl btn-primary text-xs font-semibold uppercase tracking-wider mt-1"
            >
              {submitting ? 'Submitting...' : 'Register & Dispatch Simulated OTP'}
            </button>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-xs text-[#38bdf8] hover:underline font-medium"
              >
                Already registered? Back to Sign In
              </button>
            </div>
          </form>
        )}

        {/* Mode: OTP */}
        {mode === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4 text-xs text-center">
            <div className="bg-[#0f1420] p-5 rounded-xl border border-hairline">
              <span className="text-[11px] uppercase font-mono text-slate-400 block mb-1.5 font-semibold">
                Simulated 6-Digit Email/SMS OTP
              </span>
              <div className="text-3xl font-mono font-bold text-slate-100 tracking-widest tabular-nums">
                {simulatedOtp || '582910'}
              </div>
              <div className="text-xs text-[#34d399] font-mono mt-1.5 font-medium">
                Dispatched to {email}
              </div>
            </div>

            <div>
              <label className="block text-slate-300 mb-1 text-left font-medium">Enter 6-Digit Code:</label>
              <input
                type="text"
                maxLength={6}
                required
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder={simulatedOtp || '123456'}
                className="corporate-input w-full font-mono text-center text-lg tracking-widest"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl btn-primary text-xs font-semibold uppercase tracking-wider"
            >
              Confirm OTP & Submit for Admin Verification (Step 2)
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
