const { localStore } = require('../config/supabase');
const { v4: uuidv4 } = require('uuid');

async function getLedger(req, res) {
  try {
    const { status, payment_method } = req.query;
    let ledger = [...localStore.payments];

    if (status) {
      ledger = ledger.filter(p => p.status === status);
    }
    if (payment_method) {
      ledger = ledger.filter(p => p.payment_method === payment_method);
    }

    return res.json({ success: true, count: ledger.length, data: ledger });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve payment ledger' });
  }
}

async function createPayment(req, res) {
  try {
    const { rental_id, amount, payment_method, transaction_ref } = req.body;

    const token = `RNT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`;

    const newPayment = {
      id: `pay-${uuidv4().slice(0, 8)}`,
      rental_id: rental_id || null,
      user_id: req.user ? req.user.id : 'usr-guest',
      user_email: req.user ? req.user.email : 'student@viva.edu.in',
      amount: parseFloat(amount || 0),
      payment_method: payment_method || 'UPI_QR',
      status: payment_method === 'OFFLINE_STORE_CASH' ? 'PENDING_OFFLINE_PAYMENT' : 'PAID',
      transaction_ref: transaction_ref || (payment_method === 'UPI_QR' ? `UPI-QR-REF-${Date.now().toString().slice(-6)}` : `STORE-TOKEN-${token}`),
      offline_token: token,
      created_at: new Date().toISOString()
    };

    localStore.payments.unshift(newPayment);

    return res.status(201).json({
      success: true,
      message: 'Payment recorded in ledger',
      data: newPayment
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to record payment' });
  }
}

module.exports = {
  getLedger,
  createPayment
};
