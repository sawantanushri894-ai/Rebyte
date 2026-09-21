import React, { useState, useEffect } from 'react';
import {
  Users,
  Package,
  Clock,
  CreditCard,
  Recycle,
  FolderGit2,
  BarChart3,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  Plus,
  ArrowUpRight,
  Sliders,
  RefreshCw,
  Eye,
  Check,
  Percent,
  TrendingUp,
  FileText,
  UserCheck,
  Tag
} from 'lucide-react';
import ForbiddenBarrier from './ForbiddenBarrier';

export default function AdminControlCenter({ currentUser, authToken, onSwitchToAdmin, onReturnToCatalog, onNotify }) {
  if (!currentUser || currentUser.role !== 'admin') {
    return <ForbiddenBarrier onSwitchToAdmin={onSwitchToAdmin} onReturnToCatalog={onReturnToCatalog} />;
  }

  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(false);

  // Pillar 1: Users
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [inspectingUser, setInspectingUser] = useState(null);

  // Pillar 2: Inventory
  const [inventory, setInventory] = useState([]);
  const [invSearch, setInvSearch] = useState('');
  const [showAddInvModal, setShowAddInvModal] = useState(false);
  const [newInvItem, setNewInvItem] = useState({
    name: '',
    category: 'Microcontrollers',
    stock: 10,
    daily_rate: 15,
    purchase_price: 450,
    security_deposit: 200,
    shelf_location: 'Lab 302 Shelf A'
  });

  // Pillar 3: Rentals & Returns
  const [rentals, setRentals] = useState([]);
  const [rentalFilter, setRentalFilter] = useState('ALL');
  const [returnModalRental, setReturnModalRental] = useState(null);
  const [returnCondition, setReturnCondition] = useState('GOOD');
  const [damageFine, setDamageFine] = useState(0);
  const [lateFine, setLateFine] = useState(0);
  const [returnNotes, setReturnNotes] = useState('');

  // Pillar 4: Payments
  const [payments, setPayments] = useState([]);

  // Pillar 5: Donations & 1-Click Restock
  const [donations, setDonations] = useState([]);
  const [restockModalDonation, setRestockModalDonation] = useState(null);
  const [restockDailyRate, setRestockDailyRate] = useState(10);
  const [restockDeposit, setRestockDeposit] = useState(100);

  // Pillar 6: Mini Projects
  const [projects, setProjects] = useState([]);
  const [assigningProject, setAssigningProject] = useState(null);
  const [selectedMentor, setSelectedMentor] = useState('Prof. K. Venkatesh');

  // Pillar 7: Analytics
  const [analytics, setAnalytics] = useState(null);
  const [collegePct, setCollegePct] = useState(70);

  // Pillar 8: Login Audits
  const [audits, setAudits] = useState([]);
  const [auditStatusFilter, setAuditStatusFilter] = useState('ALL');

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: authToken ? `Bearer ${authToken}` : 'Bearer admin-mock-token'
  };

  useEffect(() => {
    loadTabData(activeTab);
  }, [activeTab, collegePct]);

  const loadTabData = async (tab) => {
    setLoading(true);
    try {
      if (tab === 'users') {
        const res = await fetch('/api/admin/users', { headers: authHeaders });
        const json = await res.json();
        if (json.success) setUsers(json.data);
      } else if (tab === 'inventory') {
        const res = await fetch('/api/inventory', { headers: authHeaders });
        const json = await res.json();
        if (json.success) setInventory(json.data);
      } else if (tab === 'rentals') {
        const res = await fetch('/api/admin/rentals', { headers: authHeaders });
        const json = await res.json();
        if (json.success) setRentals(json.data);
      } else if (tab === 'payments') {
        const res = await fetch('/api/admin/payments', { headers: authHeaders });
        const json = await res.json();
        if (json.success) setPayments(json.data);
      } else if (tab === 'donations') {
        const res = await fetch('/api/admin/donations', { headers: authHeaders });
        const json = await res.json();
        if (json.success) setDonations(json.data);
      } else if (tab === 'projects') {
        const res = await fetch('/api/admin/projects', { headers: authHeaders });
        const json = await res.json();
        if (json.success) setProjects(json.data);
      } else if (tab === 'analytics') {
        const res = await fetch(`/api/admin/analytics?college_pct=${collegePct}`, { headers: authHeaders });
        const json = await res.json();
        if (json.success) setAnalytics(json.data);
      } else if (tab === 'audits') {
        const res = await fetch('/api/admin/audits/logins', { headers: authHeaders });
        const json = await res.json();
        if (json.success) setAudits(json.data);
      }
    } catch (err) {
      console.error('Error fetching admin tab data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyStudent = async (userId) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/verify`, {
        method: 'POST',
        headers: authHeaders
      });
      const json = await res.json();
      if (json.success) {
        onNotify?.({ type: 'success', title: 'Student Verified', message: json.message });
        loadTabData('users');
        setInspectingUser(null);
      }
    } catch (err) {
      onNotify?.({ type: 'error', title: 'Verification Error', message: 'Failed to verify student' });
    }
  };

  const handleCollectRental = async (rentalId) => {
    try {
      const res = await fetch(`/api/rentals/${rentalId}/collect`, {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({
          counter_officer: currentUser.name || 'Prof. K. Venkatesh',
          token_scanned: true
        })
      });
      const json = await res.json();
      if (json.success) {
        onNotify?.({ type: 'success', title: 'Step 6: Handover Confirmed', message: json.message });
        loadTabData('rentals');
      }
    } catch (err) {
      onNotify?.({ type: 'error', title: 'Collection Error', message: 'Failed to mark as collected' });
    }
  };

  const handleExecuteReturn = async () => {
    if (!returnModalRental) return;
    try {
      const res = await fetch(`/api/rentals/${returnModalRental.id}/return`, {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({
          condition_on_return: returnCondition,
          damage_fine: parseFloat(damageFine || 0),
          late_fine: parseFloat(lateFine || 0),
          notes: returnNotes
        })
      });
      const json = await res.json();
      if (json.success) {
        onNotify?.({ type: 'success', title: 'Step 7: Return Complete', message: json.message });
        setReturnModalRental(null);
        loadTabData('rentals');
      }
    } catch (err) {
      onNotify?.({ type: 'error', title: 'Return Error', message: 'Failed to process return' });
    }
  };

  const handleExecuteRestock = async () => {
    if (!restockModalDonation) return;
    try {
      const res = await fetch(`/api/admin/donations/${restockModalDonation.id}/restock`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          condition_grade: 'Grade A Refurbished',
          target_shelf: 'Green Shelf E-02',
          daily_rate: parseFloat(restockDailyRate || 10),
          security_deposit: parseFloat(restockDeposit || 100)
        })
      });
      const json = await res.json();
      if (json.success) {
        onNotify?.({ type: 'success', title: 'Restock Complete', message: json.message });
        setRestockModalDonation(null);
        loadTabData('donations');
      }
    } catch (err) {
      onNotify?.({ type: 'error', title: 'Restock Error', message: 'Failed to restock donation' });
    }
  };

  const handleAssignMentor = async () => {
    if (!assigningProject) return;
    try {
      const res = await fetch(`/api/admin/projects/${assigningProject.id}/mentor`, {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({
          mentor_name: selectedMentor,
          status: 'APPROVED'
        })
      });
      const json = await res.json();
      if (json.success) {
        onNotify?.({ type: 'success', title: 'Faculty Assigned', message: json.message });
        setAssigningProject(null);
        loadTabData('projects');
      }
    } catch (err) {
      onNotify?.({ type: 'error', title: 'Assignment Error', message: 'Failed to assign mentor' });
    }
  };

  const handleCreateInventory = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/inventory', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(newInvItem)
      });
      const json = await res.json();
      if (json.success) {
        onNotify?.({ type: 'success', title: 'Inventory Added', message: json.message });
        setShowAddInvModal(false);
        loadTabData('inventory');
      }
    } catch (err) {
      onNotify?.({ type: 'error', title: 'Error', message: 'Failed to add inventory item' });
    }
  };

  const tabs = [
    { id: 'users', label: 'Users', icon: Users, badge: users.filter(u => u.status === 'pending_verification').length },
    { id: 'inventory', label: 'Inventory', icon: Package, badge: inventory.length },
    { id: 'rentals', label: 'Rentals & Returns', icon: Clock, badge: rentals.filter(r => r.status === 'APPROVED' || r.status === 'COLLECTED').length },
    { id: 'payments', label: 'Payment Ledger', icon: CreditCard, badge: payments.length },
    { id: 'donations', label: 'E-Waste Donations', icon: Recycle, badge: donations.filter(d => d.status === 'PENDING_EVALUATION').length },
    { id: 'projects', label: 'Mini Projects', icon: FolderGit2, badge: projects.filter(p => p.status === 'PENDING_REVIEW').length },
    { id: 'analytics', label: 'Reports & Revenue', icon: BarChart3 },
    { id: 'audits', label: 'Login Audits', icon: ShieldCheck, badge: audits.length }
  ];

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 pb-20">
      {/* Admin Header Bar */}
      <div className="border-b border-hairline bg-[#0f1420] px-6 sm:px-8 py-5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#1e293b] border border-hairline flex items-center justify-center text-[#38bdf8] shadow-sm">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-lg font-bold tracking-tight text-slate-100">
                  ReByte Admin Control Center
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono status-pill-primary uppercase tracking-wider font-medium">
                  VIVA ECE Dept
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Authorized Faculty: <strong className="text-slate-200">{currentUser.name}</strong> ({currentUser.email})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => loadTabData(activeTab)}
              className="py-2 px-3 rounded-lg btn-secondary text-xs flex items-center gap-2"
              title="Refresh Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#38bdf8]' : ''}`} />
              <span className="hidden sm:inline">Refresh Data</span>
            </button>
            <button
              onClick={onReturnToCatalog}
              className="py-2 px-3.5 rounded-lg btn-secondary text-xs flex items-center gap-1.5"
            >
              Student View
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 8 Core Domain Tabs */}
      <div className="border-b border-hairline bg-[#0b0f17]/95 sticky top-0 z-20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 overflow-x-auto flex gap-2 py-3 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`admin-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? 'bg-[#1e293b] text-slate-100 border border-slate-600 shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#151b28]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#38bdf8]' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono tabular-nums font-semibold ${
                    isActive ? 'bg-[#38bdf8] text-[#0b0f17]' : 'bg-[#1e293b] text-slate-300 border border-hairline'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Workspace Area */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 pt-8">
        {/* PILLAR 1: USER MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-100">Student & Faculty Registry</h2>
                <p className="text-xs text-slate-400 mt-0.5">Inspect college credentials and approve pending accounts (Infographic Step 2).</p>
              </div>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter student, ID, or email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="corporate-input pl-10 py-2 text-xs w-72"
                />
              </div>
            </div>

            <div className="corporate-card rounded-2xl overflow-hidden border border-hairline">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#0f1420] border-b border-hairline text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                      <th className="py-4 px-5">Student / User</th>
                      <th className="py-4 px-5">College ID / Year</th>
                      <th className="py-4 px-5">Role</th>
                      <th className="py-4 px-5">Status</th>
                      <th className="py-4 px-5">Registered Date</th>
                      <th className="py-4 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hairline">
                    {users
                      .filter(u => !userSearch || u.name?.toLowerCase().includes(userSearch.toLowerCase()) || u.email?.toLowerCase().includes(userSearch.toLowerCase()) || u.college_id?.toLowerCase().includes(userSearch.toLowerCase()))
                      .map((u) => {
                        const isPending = u.status === 'pending_verification';
                        return (
                          <tr key={u.id} className="hover:bg-[#1c2436]/50 transition-colors">
                            <td className="py-4 px-5">
                              <div className="font-semibold text-slate-100 text-sm">{u.name}</div>
                              <div className="text-xs text-slate-400 font-mono mt-0.5">{u.email}</div>
                            </td>
                            <td className="py-4 px-5">
                              <span className="font-mono text-xs px-2.5 py-1 rounded bg-[#0f1420] border border-hairline text-slate-300">
                                {u.college_id || 'FACULTY-ADMIN'}
                              </span>
                              <div className="text-xs text-slate-400 mt-1">{u.department} ({u.year})</div>
                            </td>
                            <td className="py-4 px-5 uppercase text-[11px] font-mono">
                              <span className={`px-2.5 py-1 rounded font-medium ${u.role === 'admin' ? 'status-pill-primary' : 'bg-[#0f1420] text-slate-300'}`}>
                                {u.role}
                              </span>
                            </td>
                            <td className="py-4 px-5">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono uppercase font-medium ${
                                u.status === 'verified'
                                  ? 'status-pill-success'
                                  : u.status === 'pending_verification'
                                  ? 'status-pill-warning'
                                  : 'status-pill-danger'
                              }`}>
                                {u.status === 'verified' && <CheckCircle2 className="w-3.5 h-3.5" />}
                                {u.status === 'pending_verification' && <Clock className="w-3.5 h-3.5" />}
                                {u.status}
                              </span>
                            </td>
                            <td className="py-4 px-5 text-slate-400 font-mono text-xs tabular-nums">
                              {new Date(u.created_at || Date.now()).toLocaleDateString('en-IN')}
                            </td>
                            <td className="py-4 px-5 text-right">
                              {isPending ? (
                                <div className="flex items-center justify-end gap-2.5">
                                  <button
                                    onClick={() => setInspectingUser(u)}
                                    className="p-2 rounded-lg btn-secondary text-xs"
                                    title="Inspect ID Card"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleVerifyStudent(u.id)}
                                    className="py-1.5 px-3.5 rounded-lg btn-primary text-xs font-semibold uppercase flex items-center gap-1.5"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    Verify
                                  </button>
                                </div>
                              ) : (
                                <span className="text-xs text-[#34d399] font-mono font-medium">Active Verified</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* PILLAR 2: INVENTORY MANAGEMENT */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-100">Lab Component Stock & Pricing CRUD</h2>
                <p className="text-xs text-slate-400 mt-0.5">Manage daily rental rates, replacement values, and refundable security deposits.</p>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Search catalog..."
                  value={invSearch}
                  onChange={(e) => setInvSearch(e.target.value)}
                  className="corporate-input py-2 text-xs w-60"
                />
                <button
                  onClick={() => setShowAddInvModal(true)}
                  className="py-2 px-4 rounded-xl btn-primary text-xs font-semibold flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Component
                </button>
              </div>
            </div>

            <div className="corporate-card rounded-2xl overflow-hidden border border-hairline">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#0f1420] border-b border-hairline text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                      <th className="py-4 px-5">Component Item</th>
                      <th className="py-4 px-5">Category</th>
                      <th className="py-4 px-5">Stock</th>
                      <th className="py-4 px-5">Daily Rate</th>
                      <th className="py-4 px-5">Security Deposit</th>
                      <th className="py-4 px-5">Location</th>
                      <th className="py-4 px-5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hairline">
                    {inventory
                      .filter(i => !invSearch || i.name?.toLowerCase().includes(invSearch.toLowerCase()) || i.category?.toLowerCase().includes(invSearch.toLowerCase()))
                      .map((item) => (
                        <tr key={item.id} className="hover:bg-[#1c2436]/50 transition-colors">
                          <td className="py-4 px-5">
                            <div className="font-semibold text-slate-100 text-sm">{item.name}</div>
                            <div className="text-xs text-slate-400 line-clamp-1 mt-0.5">{item.description}</div>
                          </td>
                          <td className="py-4 px-5 font-mono text-xs">
                            <span className="px-2.5 py-1 rounded bg-[#0f1420] border border-hairline text-slate-300">
                              {item.category}
                            </span>
                          </td>
                          <td className="py-4 px-5 font-mono text-xs tabular-nums">
                            <span className={`font-semibold ${item.stock > 0 ? 'text-[#34d399]' : 'text-[#fb7185]'}`}>
                              {item.stock} / {item.total_stock || item.stock}
                            </span>
                          </td>
                          <td className="py-4 px-5 font-mono text-xs tabular-nums text-slate-100 font-semibold">
                            ₹{item.daily_rate}/day
                          </td>
                          <td className="py-4 px-5 font-mono text-xs tabular-nums text-slate-300">
                            ₹{item.security_deposit}
                          </td>
                          <td className="py-4 px-5 font-mono text-xs text-slate-400">
                            {item.shelf_location || 'Rack B-03'}
                          </td>
                          <td className="py-4 px-5 text-right">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono uppercase font-semibold ${
                              item.stock > 0 ? 'status-pill-success' : 'status-pill-danger'
                            }`}>
                              {item.stock > 0 ? 'In Stock' : 'Depleted'}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* PILLAR 3: RENTALS & RETURNS */}
        {activeTab === 'rentals' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-100">Rental Tracking & Counter Sign-off</h2>
                <p className="text-xs text-slate-400 mt-0.5">Infographic Step 6 (Offline Collection) & Step 7 (Condition Inspection & Deposit Refund).</p>
              </div>
              <div className="flex items-center gap-2">
                {['ALL', 'APPROVED', 'COLLECTED', 'RETURNED'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setRentalFilter(st)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-mono uppercase transition-all ${
                      rentalFilter === st
                        ? 'bg-[#1e293b] text-slate-100 border border-slate-600 font-semibold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="corporate-card rounded-2xl overflow-hidden border border-hairline">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#0f1420] border-b border-hairline text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                      <th className="py-4 px-5">Pickup Token</th>
                      <th className="py-4 px-5">Borrower Student</th>
                      <th className="py-4 px-5">Hardware Item</th>
                      <th className="py-4 px-5">Deposit & Fees</th>
                      <th className="py-4 px-5">Status & Due Date</th>
                      <th className="py-4 px-5 text-right">Lifecycle Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hairline">
                    {rentals
                      .filter(r => rentalFilter === 'ALL' || r.status === rentalFilter)
                      .map((r) => {
                        const isApproved = r.status === 'APPROVED';
                        const isCollected = r.status === 'COLLECTED';
                        const isReturned = r.status === 'RETURNED';
                        return (
                          <tr key={r.id} className="hover:bg-[#1c2436]/50 transition-colors">
                            <td className="py-4 px-5 font-mono">
                              <span className="font-semibold text-slate-100 text-xs">{r.pickup_token}</span>
                              <div className="text-[11px] text-slate-400 font-sans mt-0.5">{r.payment_method}</div>
                            </td>
                            <td className="py-4 px-5">
                              <div className="font-semibold text-slate-100 text-sm">{r.user_name}</div>
                              <div className="text-xs text-slate-400 font-mono mt-0.5">{r.user_email}</div>
                            </td>
                            <td className="py-4 px-5">
                              <div className="font-medium text-slate-200 text-xs">{r.item_name}</div>
                              <div className="text-xs text-slate-400 font-mono mt-0.5">{r.duration_days} Days ({r.rental_type})</div>
                            </td>
                            <td className="py-4 px-5 font-mono text-xs tabular-nums">
                              <div className="text-slate-200">Fee: ₹{r.rental_fee}</div>
                              <div className="text-[#34d399] font-medium">Deposit: ₹{r.security_deposit}</div>
                            </td>
                            <td className="py-4 px-5">
                              <span className={`px-3 py-1 rounded-full text-xs font-mono uppercase inline-block font-medium ${
                                isCollected ? 'status-pill-warning' : isReturned ? 'status-pill-success' : 'status-pill-primary'
                              }`}>
                                {r.status}
                              </span>
                              {r.due_date && (
                                <div className="text-xs font-mono text-slate-400 mt-1.5">
                                  Due: {new Date(r.due_date).toLocaleDateString('en-IN')}
                                </div>
                              )}
                            </td>
                            <td className="py-4 px-5 text-right">
                              {isApproved && (
                                <button
                                  onClick={() => handleCollectRental(r.id)}
                                  className="py-2 px-3.5 rounded-xl btn-primary text-xs font-semibold uppercase tracking-wider"
                                >
                                  Step 6: Mark Collected
                                </button>
                              )}
                              {isCollected && (
                                <button
                                  onClick={() => {
                                    setReturnModalRental(r);
                                    setReturnCondition('GOOD');
                                    setDamageFine(0);
                                    setLateFine(0);
                                  }}
                                  className="py-2 px-3.5 rounded-xl btn-secondary text-xs font-semibold hover:border-slate-500"
                                >
                                  Step 7: Return & Inspect
                                </button>
                              )}
                              {isReturned && (
                                <span className="text-xs font-mono text-[#34d399] font-medium">
                                  Settled (Refund ₹{r.refunded_deposit})
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* PILLAR 4: PAYMENTS */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-100">Unified Transaction Ledger</h2>
              <p className="text-xs text-slate-400 mt-0.5">Real-time ledger recording UPI QR codes, Card payments, and College Counter Cash tokens.</p>
            </div>

            <div className="corporate-card rounded-2xl overflow-hidden border border-hairline">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#0f1420] border-b border-hairline text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                      <th className="py-4 px-5">Transaction ID</th>
                      <th className="py-4 px-5">User / Email</th>
                      <th className="py-4 px-5">Method & Reference</th>
                      <th className="py-4 px-5">Amount</th>
                      <th className="py-4 px-5">Status</th>
                      <th className="py-4 px-5 text-right">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hairline font-mono text-xs">
                    {payments.map((p) => (
                      <tr key={p.id} className="hover:bg-[#1c2436]/50 transition-colors">
                        <td className="py-4 px-5 text-slate-300">{p.id}</td>
                        <td className="py-4 px-5 font-sans text-xs text-slate-200">{p.user_email}</td>
                        <td className="py-4 px-5">
                          <span className="text-slate-100 font-medium">{p.payment_method}</span>
                          <div className="text-[11px] text-slate-400 mt-0.5">{p.transaction_ref || p.offline_token}</div>
                        </td>
                        <td className="py-4 px-5 font-bold tabular-nums">
                          <span className={p.amount < 0 ? 'text-[#34d399]' : 'text-slate-100'}>
                            ₹{Math.abs(p.amount)} {p.amount < 0 ? '(Refund)' : ''}
                          </span>
                        </td>
                        <td className="py-4 px-5">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-semibold ${
                            p.status === 'PAID' ? 'status-pill-success' : p.status === 'REFUNDED' ? 'status-pill-primary' : 'status-pill-warning'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="py-4 px-5 text-right text-slate-400 tabular-nums">
                          {new Date(p.created_at || Date.now()).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* PILLAR 5: DONATIONS & 1-CLICK RESTOCK */}
        {activeTab === 'donations' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-100">E-Waste Recycling & Donation Pipeline</h2>
              <p className="text-xs text-slate-400 mt-0.5">Evaluate student e-waste donations and convert verified salvage into active catalog stock with 1-click.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {donations.map((d) => {
                const isPending = d.status === 'PENDING_EVALUATION';
                const isRestocked = d.status === 'RESTOCKED';
                return (
                  <div key={d.id} className="corporate-card rounded-2xl p-6 border border-hairline flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-[#0f1420] border border-hairline text-slate-400">
                          {d.id}
                        </span>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono uppercase font-semibold ${
                          isRestocked ? 'status-pill-success' : isPending ? 'status-pill-warning' : 'status-pill-danger'
                        }`}>
                          {d.status}
                        </span>
                      </div>

                      <h3 className="font-semibold text-base text-slate-100 mb-1.5">{d.component_name}</h3>
                      <p className="text-xs text-slate-400 mb-4 leading-relaxed">{d.condition_description}</p>

                      <div className="bg-[#0f1420] rounded-xl p-3.5 space-y-1.5 font-mono text-xs mb-5 border border-hairline">
                        <div className="flex justify-between text-slate-400">
                          <span>Donated By:</span>
                          <span className="text-slate-200">{d.student_name}</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Est. Weight:</span>
                          <span className="text-[#34d399] font-medium">{d.estimated_weight_kg || 0.25} kg</span>
                        </div>
                      </div>
                    </div>

                    {isPending ? (
                      <button
                        onClick={() => {
                          setRestockModalDonation(d);
                          setRestockDailyRate(10);
                          setRestockDeposit(100);
                        }}
                        className="w-full py-2.5 rounded-xl btn-primary text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2"
                      >
                        <Recycle className="w-4 h-4" />
                        1-Click Restock to Catalog
                      </button>
                    ) : (
                      <div className="text-center py-2 text-xs text-[#34d399] font-mono flex items-center justify-center gap-1.5 font-medium">
                        <CheckCircle2 className="w-4 h-4" />
                        Restocked to Active Catalog
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* PILLAR 6: MINI PROJECTS */}
        {activeTab === 'projects' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-100">Capstone & Mini-Project Proposals</h2>
              <p className="text-xs text-slate-400 mt-0.5">Review student technical abstracts, required hardware, and assign faculty mentors.</p>
            </div>

            <div className="space-y-4">
              {projects.map((proj) => (
                <div key={proj.id} className="corporate-card rounded-2xl p-6 border border-hairline">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-3">
                    <div>
                      <div className="flex items-center gap-2.5 mb-1.5">
                        <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-[#0f1420] border border-hairline text-slate-400">
                          {proj.id}
                        </span>
                        <h3 className="font-semibold text-base text-slate-100">{proj.title}</h3>
                      </div>
                      <p className="text-xs text-slate-400">
                        Proposed by: <strong className="text-slate-200">{proj.student_name}</strong> ({proj.student_email})
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-mono uppercase font-medium ${
                        proj.status === 'APPROVED' ? 'status-pill-success' : 'status-pill-warning'
                      }`}>
                        {proj.status}
                      </span>
                      {proj.status === 'PENDING_REVIEW' && (
                        <button
                          onClick={() => {
                            setAssigningProject(proj);
                            setSelectedMentor('Prof. K. Venkatesh');
                          }}
                          className="py-2 px-3.5 rounded-xl btn-primary text-xs font-semibold uppercase flex items-center gap-1.5"
                        >
                          Assign Mentor
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 mb-4 bg-[#0f1420] p-4 rounded-xl border border-hairline leading-relaxed">
                    {proj.abstract}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-hairline text-xs font-mono">
                    <div className="flex flex-wrap items-center gap-2">
                      <Tag className="w-3.5 h-3.5 text-[#38bdf8]" />
                      {proj.domain_tags?.map((t, idx) => (
                        <span key={idx} className="px-2.5 py-0.5 rounded bg-[#1e293b] border border-hairline text-slate-300 text-[11px]">
                          {t}
                        </span>
                      ))}
                    </div>

                    <div>
                      <span className="text-slate-400">Mentor: </span>
                      <strong className={proj.mentor_assigned ? 'text-[#38bdf8]' : 'text-slate-500'}>
                        {proj.mentor_assigned || 'Awaiting Assignment'}
                      </strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PILLAR 7: REPORTS & REVENUE */}
        {activeTab === 'analytics' && analytics && (
          <div className="space-y-8">
            <div>
              <h2 className="text-lg font-semibold text-slate-100">High-Level Operations & Revenue Sharing</h2>
              <p className="text-xs text-slate-400 mt-0.5">Platform KPIs and dynamic institutional revenue distribution model.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="corporate-card rounded-2xl p-5 border border-hairline">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                  <span>Hardware Utilization Rate</span>
                  <Percent className="w-4 h-4 text-[#38bdf8]" />
                </div>
                <div className="text-2xl font-bold font-mono text-slate-100 tabular-nums">
                  {analytics.kpis.utilization_rate_pct}%
                </div>
                <div className="text-xs text-slate-400 mt-1">Active campus lab deployment</div>
              </div>

              <div className="corporate-card rounded-2xl p-5 border border-hairline">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                  <span>E-Waste Diverted</span>
                  <Recycle className="w-4 h-4 text-[#34d399]" />
                </div>
                <div className="text-2xl font-bold font-mono text-[#34d399] tabular-nums">
                  {analytics.kpis.ewaste_diverted_kg} kg
                </div>
                <div className="text-xs text-slate-400 mt-1">Refurbished components saved</div>
              </div>

              <div className="corporate-card rounded-2xl p-5 border border-hairline">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                  <span>Student Savings</span>
                  <TrendingUp className="w-4 h-4 text-[#fbbf24]" />
                </div>
                <div className="text-2xl font-bold font-mono text-[#fbbf24] tabular-nums">
                  ₹{analytics.kpis.student_savings_inr.toLocaleString('en-IN')}
                </div>
                <div className="text-xs text-slate-400 mt-1">Saved vs outright retail purchase</div>
              </div>

              <div className="corporate-card rounded-2xl p-5 border border-hairline">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                  <span>Verified Students</span>
                  <UserCheck className="w-4 h-4 text-slate-300" />
                </div>
                <div className="text-2xl font-bold font-mono text-slate-100 tabular-nums">
                  {analytics.kpis.total_verified_students}
                </div>
                <div className="text-xs text-slate-400 mt-1">Active ECE accounts</div>
              </div>
            </div>

            <div className="corporate-card rounded-2xl p-7 border border-hairline shadow-lg">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <Sliders className="w-5 h-5 text-[#38bdf8]" />
                  <h3 className="font-semibold text-base text-slate-100">Institutional Revenue Sharing Calculator</h3>
                </div>
                <span className="text-xs font-mono status-pill-primary px-3 py-1 rounded-full font-semibold">
                  Gross Pool: ₹{analytics.revenue_sharing.gross_pool_inr.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-xs font-mono mb-2.5">
                    <span className="text-slate-200">
                      College Share: <strong className="text-[#34d399]">{collegePct}%</strong> (VIVA Institute Lab Fund)
                    </span>
                    <span className="text-slate-400">
                      Service Provider Share: <strong className="text-[#38bdf8]">{100 - collegePct}%</strong> (ReByte Platform)
                    </span>
                  </div>

                  <input
                    type="range"
                    min="50"
                    max="90"
                    step="5"
                    value={collegePct}
                    onChange={(e) => setCollegePct(parseInt(e.target.value, 10))}
                    className="w-full accent-[#38bdf8] cursor-pointer h-2 bg-[#0f1420] rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                  <div className="bg-[#0f1420] p-5 rounded-xl border border-hairline">
                    <div className="text-xs text-slate-400">College Lab Fund Allocation</div>
                    <div className="text-2xl font-bold font-mono text-[#34d399] mt-1 tabular-nums">
                      ₹{analytics.revenue_sharing.college_share_inr.toLocaleString('en-IN')}
                    </div>
                    <div className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                      Directly reinvested in lab equipment calibration & student toolkits.
                    </div>
                  </div>

                  <div className="bg-[#0f1420] p-5 rounded-xl border border-hairline">
                    <div className="text-xs text-slate-400">ReByte Operator Allocation</div>
                    <div className="text-2xl font-bold font-mono text-[#38bdf8] mt-1 tabular-nums">
                      ₹{analytics.revenue_sharing.service_provider_share_inr.toLocaleString('en-IN')}
                    </div>
                    <div className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                      Platform hosting, Supabase PostgreSQL, and automated ledger operations.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PILLAR 8: LOGIN AUDIT HISTORY */}
        {activeTab === 'audits' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-100">Security Login Audit History</h2>
                <p className="text-xs text-slate-400 mt-0.5">Queryable audit trail tracking IP address, user agent, timestamps, and authentication failures.</p>
              </div>
              <div className="flex items-center gap-2">
                {['ALL', 'SUCCESS', 'FAILED'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setAuditStatusFilter(st)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-mono uppercase transition-all ${
                      auditStatusFilter === st
                        ? 'bg-[#1e293b] text-slate-100 border border-slate-600 font-semibold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="corporate-card rounded-2xl overflow-hidden border border-hairline">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#0f1420] border-b border-hairline text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                      <th className="py-4 px-5">Audit ID & Status</th>
                      <th className="py-4 px-5">Account Email / Role</th>
                      <th className="py-4 px-5">IP Address</th>
                      <th className="py-4 px-5">User Agent / Client</th>
                      <th className="py-4 px-5">Notes / Failure Reason</th>
                      <th className="py-4 px-5 text-right">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hairline font-mono text-xs">
                    {audits
                      .filter(a => auditStatusFilter === 'ALL' || a.status === auditStatusFilter)
                      .map((a) => {
                        const isSuccess = a.status === 'SUCCESS';
                        return (
                          <tr key={a.id} className="hover:bg-[#1c2436]/50 transition-colors">
                            <td className="py-4 px-5">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase inline-flex items-center gap-1.5 font-semibold ${
                                isSuccess ? 'status-pill-success' : 'status-pill-danger'
                              }`}>
                                {isSuccess ? <Check className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                                {a.status}
                              </span>
                              <div className="text-[11px] text-slate-400 mt-1">{a.id}</div>
                            </td>
                            <td className="py-4 px-5 font-sans text-xs">
                              <div className="font-semibold text-slate-100">{a.email}</div>
                              <span className="font-mono text-[11px] text-slate-400 uppercase">{a.role}</span>
                            </td>
                            <td className="py-4 px-5 text-slate-300">{a.ip_address}</td>
                            <td className="py-4 px-5 text-slate-400 text-[11px] max-w-xs truncate" title={a.user_agent}>
                              {a.user_agent}
                            </td>
                            <td className="py-4 px-5 text-xs font-sans">
                              {a.failure_reason ? (
                                <span className="text-[#fb7185]">{a.failure_reason}</span>
                              ) : (
                                <span className="text-[#34d399]">Authentication successful</span>
                              )}
                            </td>
                            <td className="py-4 px-5 text-right text-slate-400 tabular-nums">
                              {new Date(a.timestamp || Date.now()).toLocaleString('en-IN')}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* INSPECT USER MODAL */}
      {inspectingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="corporate-card rounded-2xl max-w-lg w-full p-7 border border-hairline shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-hairline mb-5">
              <h3 className="font-bold text-slate-100 flex items-center gap-2 text-base">
                <UserCheck className="w-5 h-5 text-[#38bdf8]" />
                Verify Student Identity (Step 2)
              </h3>
              <button onClick={() => setInspectingUser(null)} className="text-slate-400 hover:text-slate-200">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3.5 bg-[#0f1420] p-4 rounded-xl border border-hairline">
                <div>
                  <span className="text-slate-400 block mb-0.5">Student Name:</span>
                  <span className="font-semibold text-slate-100 text-sm">{inspectingUser.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">College ID:</span>
                  <span className="font-mono text-[#38bdf8] text-sm font-semibold">{inspectingUser.college_id}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Department:</span>
                  <span className="text-slate-300">{inspectingUser.department}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Year / Semester:</span>
                  <span className="text-slate-300">{inspectingUser.year}</span>
                </div>
              </div>

              <div className="border border-dashed border-slate-700 rounded-xl p-5 text-center bg-[#0f1420]/60">
                <div className="w-full h-32 bg-[#151b28] rounded-lg border border-hairline flex flex-col items-center justify-center text-slate-400 mb-2">
                  <FileText className="w-8 h-8 text-[#38bdf8] mb-1.5" />
                  <span className="font-mono text-xs text-slate-200">VIVA Institute ID Card Verified</span>
                  <span className="text-[11px] text-slate-400 font-mono mt-0.5">HASH: 88f7-viva-ece-id.png</span>
                </div>
                <p className="text-xs text-slate-400">
                  College domain verified via <strong className="text-slate-200">{inspectingUser.email}</strong>
                </p>
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  onClick={() => handleVerifyStudent(inspectingUser.id)}
                  className="flex-1 py-3 rounded-xl btn-primary text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Approve & Unlock Rentals
                </button>
                <button
                  onClick={() => setInspectingUser(null)}
                  className="py-3 px-5 rounded-xl btn-secondary text-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 7 RETURN MODAL */}
      {returnModalRental && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="corporate-card rounded-2xl max-w-lg w-full p-7 border border-hairline shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-hairline mb-5">
              <h3 className="font-bold text-slate-100 flex items-center gap-2 text-base">
                <CheckCircle2 className="w-5 h-5 text-[#34d399]" />
                Step 7: Physical Inspection & Deposit Refund
              </h3>
              <button onClick={() => setReturnModalRental(null)} className="text-slate-400 hover:text-slate-200">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-[#0f1420] p-4 rounded-xl border border-hairline space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Item:</span>
                  <span className="font-semibold text-slate-100">{returnModalRental.item_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Borrower:</span>
                  <span className="font-mono text-slate-200">{returnModalRental.user_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Deposit Held:</span>
                  <span className="font-mono text-[#34d399] font-bold">₹{returnModalRental.security_deposit}</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1.5 font-medium">Hardware Condition Assessment:</label>
                <select
                  value={returnCondition}
                  onChange={(e) => {
                    setReturnCondition(e.target.value);
                    if (e.target.value === 'GOOD') setDamageFine(0);
                    if (e.target.value === 'MINOR_DAMAGE') setDamageFine(50);
                    if (e.target.value === 'DAMAGED_UNUSABLE') setDamageFine(returnModalRental.security_deposit);
                  }}
                  className="corporate-input w-full font-mono text-xs"
                >
                  <option value="GOOD">Grade A: Fully Working / No Damage (Full Refund)</option>
                  <option value="MINOR_DAMAGE">Grade B: Minor Cosmetic / Header Pins Bent (-₹50 Fine)</option>
                  <option value="DAMAGED_UNUSABLE">Grade C: Blown Chip / Burnt / Missing Parts (Forfeit Deposit)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-slate-300 mb-1">Damage Fine (₹):</label>
                  <input
                    type="number"
                    min="0"
                    value={damageFine}
                    onChange={(e) => setDamageFine(parseFloat(e.target.value) || 0)}
                    className="corporate-input w-full tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Late Fine (₹):</label>
                  <input
                    type="number"
                    min="0"
                    value={lateFine}
                    onChange={(e) => setLateFine(parseFloat(e.target.value) || 0)}
                    className="corporate-input w-full tabular-nums"
                  />
                </div>
              </div>

              <div className="bg-[#0f1420] border border-hairline rounded-xl p-4 space-y-1.5 font-mono text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Security Deposit Held:</span>
                  <span>₹{returnModalRental.security_deposit}</span>
                </div>
                <div className="flex justify-between text-[#fb7185]">
                  <span>Total Fines Deducted:</span>
                  <span>-₹{parseFloat(damageFine || 0) + parseFloat(lateFine || 0)}</span>
                </div>
                <div className="border-t border-hairline pt-2 flex justify-between font-bold text-sm text-[#34d399]">
                  <span>Net Refund to Student Ledger:</span>
                  <span>₹{Math.max(0, returnModalRental.security_deposit - (parseFloat(damageFine || 0) + parseFloat(lateFine || 0)))}</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Lab Inspector Remarks:</label>
                <input
                  type="text"
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                  placeholder="Multimeter tested, pins inspected by faculty."
                  className="corporate-input w-full"
                />
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  onClick={handleExecuteReturn}
                  className="flex-1 py-3 rounded-xl btn-primary text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Complete Return & Restock (+1)
                </button>
                <button onClick={() => setReturnModalRental(null)} className="py-3 px-5 rounded-xl btn-secondary text-xs">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 1-CLICK RESTOCK MODAL */}
      {restockModalDonation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="corporate-card rounded-2xl max-w-md w-full p-7 border border-hairline shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-hairline mb-5">
              <h3 className="font-bold text-slate-100 flex items-center gap-2 text-base">
                <Recycle className="w-5 h-5 text-[#34d399]" />
                Convert E-Waste to Active Catalog Inventory
              </h3>
              <button onClick={() => setRestockModalDonation(null)} className="text-slate-400 hover:text-slate-200">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <p className="text-slate-300 leading-relaxed">
                Evaluating salvage: <strong className="text-slate-100">{restockModalDonation.component_name}</strong>. This automatically publishes active inventory to the student catalog.
              </p>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-slate-300 mb-1">Rental Daily Rate (₹):</label>
                  <input
                    type="number"
                    value={restockDailyRate}
                    onChange={(e) => setRestockDailyRate(parseFloat(e.target.value) || 10)}
                    className="corporate-input w-full tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Security Deposit (₹):</label>
                  <input
                    type="number"
                    value={restockDeposit}
                    onChange={(e) => setRestockDeposit(parseFloat(e.target.value) || 100)}
                    className="corporate-input w-full tabular-nums"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  onClick={handleExecuteRestock}
                  className="flex-1 py-3 rounded-xl btn-primary text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  Confirm Restock to Catalog
                </button>
                <button onClick={() => setRestockModalDonation(null)} className="py-3 px-5 rounded-xl btn-secondary text-xs">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ASSIGN MENTOR MODAL */}
      {assigningProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="corporate-card rounded-2xl max-w-md w-full p-7 border border-hairline shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-hairline mb-5">
              <h3 className="font-bold text-slate-100 flex items-center gap-2 text-base">
                <FolderGit2 className="w-5 h-5 text-[#38bdf8]" />
                Assign Faculty Guide / Mentor
              </h3>
              <button onClick={() => setAssigningProject(null)} className="text-slate-400 hover:text-slate-200">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-[#0f1420] p-4 rounded-xl border border-hairline">
                <div className="text-slate-400">Project:</div>
                <div className="font-semibold text-slate-100 text-sm mt-1">{assigningProject.title}</div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1.5">Select VIVA Faculty Mentor:</label>
                <select
                  value={selectedMentor}
                  onChange={(e) => setSelectedMentor(e.target.value)}
                  className="corporate-input w-full text-xs"
                >
                  <option value="Prof. K. Venkatesh">Prof. K. Venkatesh (Lab In-Charge & IoT Lead)</option>
                  <option value="Dr. S. R. Patil">Dr. S. R. Patil (Embedded Systems)</option>
                  <option value="Prof. N. Kulkarni">Prof. N. Kulkarni (Robotics & Automation)</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  onClick={handleAssignMentor}
                  className="flex-1 py-3 rounded-xl btn-primary text-xs font-semibold uppercase tracking-wider"
                >
                  Confirm & Approve Proposal
                </button>
                <button onClick={() => setAssigningProject(null)} className="py-3 px-5 rounded-xl btn-secondary text-xs">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD INVENTORY MODAL */}
      {showAddInvModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="corporate-card rounded-2xl max-w-md w-full p-7 border border-hairline shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-hairline mb-5">
              <h3 className="font-bold text-slate-100 flex items-center gap-2 text-base">
                <Package className="w-5 h-5 text-[#38bdf8]" />
                Add Component to Catalog
              </h3>
              <button onClick={() => setShowAddInvModal(false)} className="text-slate-400 hover:text-slate-200">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInventory} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Component Name:</label>
                <input
                  type="text"
                  required
                  value={newInvItem.name}
                  onChange={(e) => setNewInvItem({ ...newInvItem, name: e.target.value })}
                  placeholder="e.g. ESP32-CAM AI-Thinker Module"
                  className="corporate-input w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-slate-300 mb-1">Category:</label>
                  <select
                    value={newInvItem.category}
                    onChange={(e) => setNewInvItem({ ...newInvItem, category: e.target.value })}
                    className="corporate-input w-full"
                  >
                    <option value="Microcontrollers">Microcontrollers</option>
                    <option value="Sensors">Sensors</option>
                    <option value="Actuators">Actuators</option>
                    <option value="Displays">Displays</option>
                    <option value="Tools & Passives">Tools & Passives</option>
                    <option value="E-Waste Refurbished">E-Waste Refurbished</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Initial Stock:</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newInvItem.stock}
                    onChange={(e) => setNewInvItem({ ...newInvItem, stock: parseInt(e.target.value, 10) })}
                    className="corporate-input w-full tabular-nums"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Daily Rate (₹):</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newInvItem.daily_rate}
                    onChange={(e) => setNewInvItem({ ...newInvItem, daily_rate: parseFloat(e.target.value) })}
                    className="corporate-input w-full tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Deposit (₹):</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={newInvItem.security_deposit}
                    onChange={(e) => setNewInvItem({ ...newInvItem, security_deposit: parseFloat(e.target.value) })}
                    className="corporate-input w-full tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Buy Price (₹):</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newInvItem.purchase_price}
                    onChange={(e) => setNewInvItem({ ...newInvItem, purchase_price: parseFloat(e.target.value) })}
                    className="corporate-input w-full tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Shelf Location:</label>
                <input
                  type="text"
                  value={newInvItem.shelf_location}
                  onChange={(e) => setNewInvItem({ ...newInvItem, shelf_location: e.target.value })}
                  placeholder="e.g. Rack C-02 (Lab 302)"
                  className="corporate-input w-full"
                />
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button type="submit" className="flex-1 py-3 rounded-xl btn-primary text-xs font-semibold uppercase">
                  Save to Catalog
                </button>
                <button type="button" onClick={() => setShowAddInvModal(false)} className="py-3 px-5 rounded-xl btn-secondary text-xs">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
