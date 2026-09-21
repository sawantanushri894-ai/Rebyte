import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ShoppingBag,
  CreditCard,
  QrCode,
  Store,
  CheckCircle2,
  ArrowRight,
  Trash2,
  Calendar,
  Sparkles,
  Copy,
  Check
} from 'lucide-react';

export default function RentalCheckoutDrawer({
  isOpen,
  onClose,
  basket = [],
  onUpdateQuantity,
  onRemoveItem,
  onClearBasket,
  currentUser,
  authToken,
  onOrderSuccess,
  onNotify
}) {
  const [durationDays, setDurationDays] = useState(7);
  const [paymentMethod, setPaymentMethod] = useState('OFFLINE_STORE_CASH');
  const [upiRef, setUpiRef] = useState('');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 9812');
  const [submitting, setSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);
  const [copiedToken, setCopiedToken] = useState(false);

  const rentalItems = basket.filter(i => i.type !== 'BUY');
  const purchaseItems = basket.filter(i => i.type === 'BUY');

  const totalRentalFee = rentalItems.reduce((acc, item) => {
    return acc + (item.daily_rate * durationDays * (item.quantity || 1));
  }, 0);

  const totalSecurityDeposit = rentalItems.reduce((acc, item) => {
    return acc + (item.security_deposit * (item.quantity || 1));
  }, 0);

  const totalPurchaseFee = purchaseItems.reduce((acc, item) => {
    return acc + (item.purchase_price * (item.quantity || 1));
  }, 0);

  const grandTotalPayable = totalRentalFee + totalSecurityDeposit + totalPurchaseFee;

  const handleCheckout = async () => {
    if (!currentUser) {
      onNotify?.({
        type: 'warning',
        title: 'Authentication Required',
        message: 'Please sign in with your college credentials (@viva.edu.in) to checkout.'
      });
      return;
    }

    if (currentUser.status !== 'verified') {
      onNotify?.({
        type: 'warning',
        title: 'Account Verification Pending',
        message: 'Your account is currently in Step 1 pending verification by VIVA ECE lab admin.'
      });
      return;
    }

    if (basket.length === 0) return;

    setSubmitting(true);
    try {
      const payload = {
        items: basket.map(item => ({
          id: item.id,
          name: item.name,
          type: item.type || 'RENT',
          duration_days: durationDays,
          quantity: item.quantity || 1,
          daily_rate: item.daily_rate,
          security_deposit: item.security_deposit,
          purchase_price: item.purchase_price
        })),
        payment_method: paymentMethod,
        payment_reference: paymentMethod === 'UPI_QR' ? (upiRef || `UPI-VIVA-${Date.now().toString().slice(-6)}`) : null,
        duration_days: durationDays
      };

      const res = await fetch('/api/rentals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authToken ? `Bearer ${authToken}` : 'Bearer student-mock-token'
        },
        body: JSON.stringify(payload)
      });

      const json = await res.json();

      if (json.success) {
        setCompletedOrder(json.data);
        onClearBasket?.();
        onOrderSuccess?.(json.data);
        onNotify?.({
          type: 'success',
          title: 'Order Approved (Step 5)',
          message: `Pickup Token: ${json.data.pickup_token}. Ready for collection.`
        });
      } else {
        onNotify?.({
          type: 'error',
          title: 'Checkout Failed',
          message: json.message || 'Unable to complete order'
        });
      }
    } catch (err) {
      onNotify?.({
        type: 'error',
        title: 'Network Error',
        message: 'Could not connect to ReByte API server'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const copyToClipboard = (token) => {
    navigator.clipboard?.writeText(token);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2500);
  };

  const resetDrawer = () => {
    setCompletedOrder(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: "tween", duration: 0.2 }}
            onClick={resetDrawer}
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
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#1e293b] border border-hairline flex items-center justify-center text-[#38bdf8]">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                      {completedOrder ? 'Checkout Complete' : 'Component Rental Cart'}
                    </h2>
                    <p className="text-xs text-slate-400">
                      {completedOrder ? 'Offline Pickup Token Issued' : `${basket.length} hardware component${basket.length === 1 ? '' : 's'} selected`}
                    </p>
                  </div>
                </div>

                <button
                  onClick={resetDrawer}
                  className="p-2 rounded-lg btn-secondary text-slate-400 hover:text-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {completedOrder ? (
                  <div className="space-y-6 py-4 text-center">
                    <div className="w-16 h-16 rounded-full bg-[#10b981]/15 border border-[#10b981]/30 mx-auto flex items-center justify-center text-[#10b981]">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>

                    <div>
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-mono status-pill-success uppercase tracking-wider font-semibold mb-2">
                        Step 5 Complete: Payment & Token
                      </span>
                      <h3 className="text-xl font-bold text-slate-100">
                        Hardware Request Confirmed!
                      </h3>
                      <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1 leading-relaxed">
                        Present this token at VIVA ECE Department Lab Counter (Lab 302) to collect your components (Step 6).
                      </p>
                    </div>

                    {/* Official Pickup Token Card */}
                    <div className="corporate-card rounded-2xl p-6 border border-hairline text-center relative shadow-lg">
                      <div className="text-[11px] uppercase font-mono tracking-widest text-[#38bdf8] font-semibold mb-1">
                        Official Offline Pickup Token
                      </div>
                      <div className="text-2xl font-mono font-bold text-slate-100 tracking-wider tabular-nums py-2">
                        {completedOrder.pickup_token}
                      </div>

                      <button
                        onClick={() => copyToClipboard(completedOrder.pickup_token)}
                        className="mt-2 inline-flex items-center gap-2 py-1.5 px-3.5 rounded-lg text-xs font-mono btn-secondary"
                      >
                        {copiedToken ? <Check className="w-4 h-4 text-[#34d399]" /> : <Copy className="w-4 h-4" />}
                        <span>{copiedToken ? 'Copied to Clipboard' : 'Copy Token'}</span>
                      </button>

                      <div className="mt-5 pt-4 border-t border-hairline flex justify-between text-xs font-mono text-slate-400">
                        <span>Items: {completedOrder.summary.items_count}</span>
                        <span>Total: ₹{completedOrder.summary.total_payable}</span>
                        <span className="text-[#34d399] font-medium">Deposit: ₹{completedOrder.summary.security_deposit}</span>
                      </div>
                    </div>

                    <div className="bg-[#0b0f17] p-4 rounded-xl border border-hairline text-left text-xs space-y-2">
                      <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-[#38bdf8]" /> Next Steps (Infographic Step 6 & 7):
                      </div>
                      <p className="text-slate-400 text-xs leading-relaxed">
                        1. Visit <strong>Lab 302</strong> with your college ID card.<br />
                        2. Lab In-Charge scans token and hands over hardware.<br />
                        3. Live due-date countdown activates in your Student Account.<br />
                        4. Return hardware within duration for 100% security deposit refund!
                      </p>
                    </div>

                    <button
                      onClick={resetDrawer}
                      className="w-full py-3 rounded-xl btn-primary text-xs font-semibold uppercase tracking-wider"
                    >
                      Done & View Active Rentals
                    </button>
                  </div>
                ) : basket.length === 0 ? (
                  <div className="text-center py-20 space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-[#151b28] border border-hairline mx-auto flex items-center justify-center text-slate-500">
                      <ShoppingBag className="w-6 h-6" />
                    </div>
                    <div className="text-sm font-semibold text-slate-100">Cart is Empty</div>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                      Select microcontrollers, sensors, or actuators from the catalog to rent or purchase for your project.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Item List */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs font-mono text-slate-400 uppercase tracking-wider font-medium">
                        <span>Selected Hardware</span>
                        <button onClick={onClearBasket} className="text-[#fb7185] hover:underline">Clear all</button>
                      </div>

                      {basket.map((item) => (
                        <div key={item.id} className="corporate-card rounded-xl p-4 border border-hairline flex items-center justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-xs text-slate-100 truncate">{item.name}</span>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0b0f17] text-[#38bdf8] border border-hairline font-medium">
                                {item.type || 'RENT'}
                              </span>
                            </div>
                            <div className="text-xs text-slate-400 font-mono mt-1 tabular-nums">
                              {item.type === 'BUY' ? (
                                `₹${item.purchase_price} outright`
                              ) : (
                                `₹${item.daily_rate}/day + ₹${item.security_deposit} dep.`
                              )}
                            </div>
                          </div>

                          <button
                            onClick={() => onRemoveItem(item.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-[#fb7185] transition-colors"
                            title="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Rental Duration Slider */}
                    {rentalItems.length > 0 && (
                      <div className="corporate-card rounded-2xl p-5 border border-hairline space-y-3.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs font-semibold text-slate-100">
                            <Calendar className="w-4 h-4 text-[#38bdf8]" />
                            <span>Rental Duration (Days)</span>
                          </div>
                          <span className="text-xs font-mono text-slate-100 font-bold tabular-nums">
                            {durationDays} Days
                          </span>
                        </div>

                        <input
                          type="range"
                          min="3"
                          max="30"
                          step="1"
                          value={durationDays}
                          onChange={(e) => setDurationDays(parseInt(e.target.value, 10))}
                          className="w-full accent-[#38bdf8] cursor-pointer h-2 bg-[#0b0f17] rounded-lg"
                        />

                        <div className="flex justify-between text-[11px] font-mono text-slate-400">
                          <span>3 days (Sprint)</span>
                          <span>7 days (Standard)</span>
                          <span>15 days</span>
                          <span>30 days (Semester)</span>
                        </div>
                      </div>
                    )}

                    {/* Payment Channel Selector */}
                    <div className="space-y-3">
                      <div className="text-xs font-mono text-slate-400 uppercase tracking-wider font-medium">
                        Step 5: Select Payment Channel
                      </div>

                      <div className="grid grid-cols-3 gap-2.5">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('OFFLINE_STORE_CASH')}
                          className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                            paymentMethod === 'OFFLINE_STORE_CASH'
                              ? 'bg-[#1e293b] border-[#38bdf8] text-slate-100 shadow-sm'
                              : 'bg-[#151b28] border-hairline text-slate-400 hover:border-slate-600'
                          }`}
                        >
                          <Store className={`w-4 h-4 mb-2 ${paymentMethod === 'OFFLINE_STORE_CASH' ? 'text-[#38bdf8]' : ''}`} />
                          <div className="text-xs font-semibold leading-tight">Lab Counter Cash</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">Pay on pickup</div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPaymentMethod('UPI_QR')}
                          className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                            paymentMethod === 'UPI_QR'
                              ? 'bg-[#1e293b] border-[#38bdf8] text-slate-100 shadow-sm'
                              : 'bg-[#151b28] border-hairline text-slate-400 hover:border-slate-600'
                          }`}
                        >
                          <QrCode className={`w-4 h-4 mb-2 ${paymentMethod === 'UPI_QR' ? 'text-[#38bdf8]' : ''}`} />
                          <div className="text-xs font-semibold leading-tight">UPI QR Code</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">GPay / PhonePe</div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPaymentMethod('CARD')}
                          className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                            paymentMethod === 'CARD'
                              ? 'bg-[#1e293b] border-[#38bdf8] text-slate-100 shadow-sm'
                              : 'bg-[#151b28] border-hairline text-slate-400 hover:border-slate-600'
                          }`}
                        >
                          <CreditCard className={`w-4 h-4 mb-2 ${paymentMethod === 'CARD' ? 'text-[#38bdf8]' : ''}`} />
                          <div className="text-xs font-semibold leading-tight">Card / NetBanking</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">RuPay / Visa</div>
                        </button>
                      </div>

                      {paymentMethod === 'UPI_QR' && (
                        <div className="p-3.5 bg-[#0b0f17] rounded-xl border border-hairline text-xs space-y-2">
                          <div className="flex items-center justify-between text-slate-300">
                            <span className="font-mono text-xs">VIVA ECE ReByte UPI ID:</span>
                            <span className="font-mono text-[#38bdf8] font-semibold">rebyte.viva@upi</span>
                          </div>
                          <input
                            type="text"
                            placeholder="Enter 12-digit UPI UTR Reference (e.g. 429810482910)"
                            value={upiRef}
                            onChange={(e) => setUpiRef(e.target.value)}
                            className="corporate-input w-full text-xs font-mono"
                          />
                        </div>
                      )}

                      {paymentMethod === 'CARD' && (
                        <div className="p-3.5 bg-[#0b0f17] rounded-xl border border-hairline text-xs space-y-2">
                          <input
                            type="text"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            className="corporate-input w-full text-xs font-mono"
                          />
                          <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                            <input type="text" defaultValue="12/28" className="corporate-input text-center" />
                            <input type="password" defaultValue="•••" className="corporate-input text-center" />
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Drawer Footer */}
              {!completedOrder && basket.length > 0 && (
                <div className="p-6 border-t border-hairline bg-[#0b0f17] space-y-4">
                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex justify-between text-slate-400">
                      <span>Rental Fee ({durationDays} days):</span>
                      <span className="tabular-nums text-slate-200">₹{totalRentalFee}</span>
                    </div>

                    {totalSecurityDeposit > 0 && (
                      <div className="flex justify-between text-[#34d399]">
                        <span>Security Deposit (Refundable):</span>
                        <span className="tabular-nums font-semibold">+₹{totalSecurityDeposit}</span>
                      </div>
                    )}

                    {totalPurchaseFee > 0 && (
                      <div className="flex justify-between text-slate-400">
                        <span>Outright Purchases:</span>
                        <span className="tabular-nums text-slate-200">₹{totalPurchaseFee}</span>
                      </div>
                    )}

                    <div className="border-t border-hairline pt-2.5 flex justify-between text-sm font-bold text-slate-100">
                      <span>Total Payable Now:</span>
                      <span className="text-white text-base tabular-nums">₹{grandTotalPayable}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleCheckout}
                    disabled={submitting}
                    className="w-full py-3.5 rounded-xl btn-primary text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                  >
                    {submitting ? (
                      <span>Generating Offline Token...</span>
                    ) : (
                      <>
                        <span>Confirm & Generate Token (Step 5)</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
