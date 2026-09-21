import React, { useState } from 'react';
import Navbar from './components/shared/Navbar';
import LifecycleBanner from './components/shared/LifecycleBanner';
import CatalogGrid from './components/student/CatalogGrid';
import RentalCheckoutDrawer from './components/student/RentalCheckoutDrawer';
import StudentAccountDrawer from './components/student/StudentAccountDrawer';
import DonationModal from './components/student/DonationModal';
import ProjectMentorshipModal from './components/student/ProjectMentorshipModal';
import AuthModal from './components/shared/AuthModal';
import AdminControlCenter from './components/admin/AdminControlCenter';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  X,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function App() {
  const defaultStudent = {
    id: 'usr-student-01',
    email: 'anushka.ece@viva.edu.in',
    name: 'Anushka Sharma',
    role: 'student',
    college_id: 'VIVA-ECE-2024-042',
    department: 'Electronics & Computer Engineering',
    year: 'SE - Sem IV',
    status: 'verified'
  };

  const defaultAdmin = {
    id: 'usr-admin-01',
    email: 'admin@viva.edu.in',
    name: 'Prof. K. Venkatesh',
    role: 'admin',
    college_id: 'VIVA-FAC-ECE-01',
    department: 'Electronics & Computer Engineering',
    year: 'Faculty In-Charge',
    status: 'verified'
  };

  const [currentUser, setCurrentUser] = useState(defaultStudent);
  const [currentRole, setCurrentRole] = useState('student');
  const [authToken, setAuthToken] = useState('student-mock-token');
  const [activeView, setActiveView] = useState('student');
  const [activeStep, setActiveStep] = useState(3);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isDonationOpen, setIsDonationOpen] = useState(false);
  const [isProjectOpen, setIsProjectOpen] = useState(false);

  const [basket, setBasket] = useState([
    {
      id: 'inv-esp32',
      name: 'ESP32-WROOM-32 Wi-Fi & BLE Dev Board',
      type: 'RENT',
      quantity: 1,
      daily_rate: 15,
      security_deposit: 250,
      purchase_price: 450
    },
    {
      id: 'inv-sensor-hcsr04',
      name: 'HC-SR04 Ultrasonic Distance Sensor',
      type: 'RENT',
      quantity: 1,
      daily_rate: 5,
      security_deposit: 50,
      purchase_price: 95
    }
  ]);

  const [notification, setNotification] = useState(null);

  const notify = (notif) => {
    setNotification(notif);
    setTimeout(() => {
      setNotification((prev) => (prev === notif ? null : prev));
    }, 4000);
  };

  const handleSwitchRole = (newRole) => {
    setCurrentRole(newRole);
    if (newRole === 'admin') {
      setCurrentUser(defaultAdmin);
      setAuthToken('admin-mock-token');
      setActiveView('admin');
      setActiveStep(2);
      notify({
        type: 'info',
        title: 'Role Switched to Faculty Admin',
        message: 'Elevated privileges enabled: User Verification, 1-Click Restock & Audit History.'
      });
    } else {
      setCurrentUser(defaultStudent);
      setAuthToken('student-mock-token');
      setActiveView('student');
      setActiveStep(3);
      notify({
        type: 'info',
        title: 'Role Switched to Student',
        message: 'Anushka Sharma (2nd Year ECE). Student catalog and checkout active.'
      });
    }
  };

  const handleAddToBasket = (item) => {
    setBasket((prev) => {
      const existing = prev.find((i) => i.id === item.id && i.type === item.type);
      if (existing) {
        notify({
          type: 'info',
          title: 'Cart Updated',
          message: `${item.name} quantity increased.`
        });
        return prev.map((i) =>
          i.id === item.id && i.type === item.type ? { ...i, quantity: (i.quantity || 1) + 1 } : i
        );
      }
      notify({
        type: 'success',
        title: 'Added to Basket',
        message: `${item.name} added for ${item.type === 'BUY' ? 'purchase' : 'rental'}.`
      });
      return [...prev, { ...item, quantity: 1 }];
    });
    setActiveStep(4);
  };

  const handleRemoveFromBasket = (itemId) => {
    setBasket((prev) => prev.filter((i) => i.id !== itemId));
  };

  const handleClearBasket = () => {
    setBasket([]);
  };

  const handleOrderSuccess = (orderData) => {
    setActiveStep(6);
  };

  const handleAuthSuccess = (user, token) => {
    setCurrentUser(user);
    setAuthToken(token);
    setCurrentRole(user.role);
    if (user.role === 'admin') {
      setActiveView('admin');
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex flex-col font-sans">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-[#151b28] border border-hairline shadow-2xl rounded-2xl p-4 flex items-start gap-3.5 transition-all duration-200">
          <div className="mt-0.5 flex-shrink-0">
            {notification.type === 'success' && <CheckCircle2 className="w-5 h-5 text-[#34d399]" />}
            {notification.type === 'warning' && <AlertTriangle className="w-5 h-5 text-[#fbbf24]" />}
            {notification.type === 'error' && <AlertCircle className="w-5 h-5 text-[#fb7185]" />}
            {notification.type === 'info' && <Sparkles className="w-5 h-5 text-[#38bdf8]" />}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-xs text-slate-100">{notification.title}</h4>
            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{notification.message}</p>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-slate-200 flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        currentRole={currentRole}
        onSwitchRole={handleSwitchRole}
        onOpenCart={() => setIsCartOpen(true)}
        cartCount={basket.length}
        onOpenAccount={() => setIsAccountOpen(true)}
        activeRentalsCount={1}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenDonation={() => setIsDonationOpen(true)}
        onOpenProject={() => setIsProjectOpen(true)}
        activeView={activeView}
        setActiveView={setActiveView}
      />

      {/* 7-Step Lifecycle State Machine Banner */}
      <LifecycleBanner
        activeStep={activeStep}
        onSelectStep={(stepNum) => {
          setActiveStep(stepNum);
          if (stepNum === 1) setIsAuthOpen(true);
          if (stepNum === 2) {
            setActiveView('admin');
            handleSwitchRole('admin');
          }
          if (stepNum === 3) setActiveView('student');
          if (stepNum === 4 || stepNum === 5) setIsCartOpen(true);
          if (stepNum === 6) setIsAccountOpen(true);
          if (stepNum === 7) {
            setActiveView('admin');
            handleSwitchRole('admin');
          }
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeView === 'admin' ? (
          <AdminControlCenter
            currentUser={currentUser}
            authToken={authToken}
            onSwitchToAdmin={() => handleSwitchRole('admin')}
            onReturnToCatalog={() => setActiveView('student')}
            onNotify={notify}
          />
        ) : (
          <div className="max-w-7xl mx-auto px-6 sm:px-8 py-10">
            {/* Campus Context Intro Banner */}
            <div className="mb-10 corporate-card rounded-2xl p-8 border border-hairline relative overflow-hidden">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono status-pill-primary uppercase tracking-wider mb-3 font-medium">
                  <Sparkles className="w-3.5 h-3.5" />
                  VIVA Institute of Technology • ECE Lab Component Portal
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100 mb-3">
                  Electronics Hardware Management & Rental Platform
                </h1>
                <p className="text-sm text-slate-400 leading-relaxed mb-6 font-normal">
                  Borrow tested microcontrollers, sensors, and actuators for semester lab assignments and capstone prototypes. Settle with 100% security deposit refunds on timely return or purchase items outright.
                </p>
                <div className="flex flex-wrap items-center gap-3.5 font-medium text-xs">
                  <button
                    onClick={() => setIsCartOpen(true)}
                    className="py-2.5 px-5 rounded-xl btn-primary uppercase tracking-wider flex items-center gap-2 font-semibold shadow-clean-sm"
                  >
                    Open Rental Basket ({basket.length})
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsDonationOpen(true)}
                    className="py-2.5 px-5 rounded-xl btn-secondary flex items-center gap-2"
                  >
                    Donate Scrap E-Waste
                  </button>
                  <button
                    onClick={() => setIsProjectOpen(true)}
                    className="py-2.5 px-5 rounded-xl btn-secondary flex items-center gap-2"
                  >
                    Submit Mini-Project Abstract
                  </button>
                </div>
              </div>
            </div>

            {/* Catalog Grid */}
            <CatalogGrid
              onAddToBasket={handleAddToBasket}
              onOpenCart={() => setIsCartOpen(true)}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-hairline bg-[#070a10] py-8 px-6 sm:px-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="font-bold text-slate-200">ReByte</span>
            <span>• Corporate Electronics Component Management</span>
          </div>
          <div className="font-mono text-xs text-slate-400">
            VIVA Institute of Technology • Mumbai University ECE Syllabus
          </div>
          <div className="text-xs">
            API Engine: <span className="text-[#34d399] font-mono font-medium">ONLINE (Port 5000)</span>
          </div>
        </div>
      </footer>

      {/* Slide-over Drawers & Modals */}
      <RentalCheckoutDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        basket={basket}
        onRemoveItem={handleRemoveFromBasket}
        onClearBasket={handleClearBasket}
        currentUser={currentUser}
        authToken={authToken}
        onOrderSuccess={handleOrderSuccess}
        onNotify={notify}
      />

      <StudentAccountDrawer
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
        currentUser={currentUser}
        authToken={authToken}
        onOpenDonation={() => setIsDonationOpen(true)}
        onOpenProject={() => setIsProjectOpen(true)}
      />

      <DonationModal
        isOpen={isDonationOpen}
        onClose={() => setIsDonationOpen(false)}
        currentUser={currentUser}
        authToken={authToken}
        onNotify={notify}
      />

      <ProjectMentorshipModal
        isOpen={isProjectOpen}
        onClose={() => setIsProjectOpen(false)}
        currentUser={currentUser}
        authToken={authToken}
        onNotify={notify}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        onNotify={notify}
      />
    </div>
  );
}
