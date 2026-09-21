const { v4: uuidv4 } = require('uuid');
const { localStore } = require('../config/supabase');

function generatePickupToken() {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randNum = Math.floor(100 + Math.random() * 900);
  return `RNT-${dateStr}-${randNum}`;
}

// Step 3-4 & 5: Create Rental Request with Mixed Basket & Payment Token
async function createRental(req, res) {
  try {
    const { items, payment_method, payment_reference, duration_days } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Basket items are required' });
    }

    const userId = req.user.id;
    const userName = req.user.name;
    const userEmail = req.user.email;
    const pickupToken = generatePickupToken();
    const createdRentals = [];

    let grandTotal = 0;
    let totalDeposit = 0;
    let totalRentalFee = 0;

    for (const basketItem of items) {
      const inv = localStore.inventory.find(i => i.id === basketItem.id);
      if (!inv) {
        return res.status(404).json({ success: false, message: `Component ${basketItem.name || basketItem.id} not found` });
      }

      if (inv.stock < (basketItem.quantity || 1)) {
        return res.status(400).json({ success: false, message: `Insufficient stock for ${inv.name}. Available: ${inv.stock}` });
      }

      const days = parseInt(basketItem.duration_days || duration_days || 7, 10);
      const isRent = basketItem.type !== 'BUY';
      
      const itemRentalFee = isRent ? (inv.daily_rate * days * (basketItem.quantity || 1)) : (inv.purchase_price * (basketItem.quantity || 1));
      const itemDeposit = isRent ? (inv.security_deposit * (basketItem.quantity || 1)) : 0;
      const itemTotal = itemRentalFee + itemDeposit;

      grandTotal += itemTotal;
      totalDeposit += itemDeposit;
      totalRentalFee += itemRentalFee;

      // Decrement stock
      inv.stock -= (basketItem.quantity || 1);
      inv.is_available = inv.stock > 0;

      const rentalRecord = {
        id: `rnt-${uuidv4().slice(0, 8)}`,
        user_id: userId,
        user_name: userName,
        user_email: userEmail,
        item_id: inv.id,
        item_name: inv.name,
        category: inv.category,
        rental_type: isRent ? 'RENT' : 'BUY',
        duration_days: isRent ? days : 0,
        daily_rate: inv.daily_rate,
        rental_fee: itemRentalFee,
        security_deposit: itemDeposit,
        total_amount: itemTotal,
        payment_method: payment_method || 'OFFLINE_STORE_CASH',
        payment_reference: payment_reference || (payment_method === 'UPI_QR' ? `UPI-${Date.now().toString().slice(-6)}` : null),
        pickup_token: pickupToken,
        status: 'APPROVED', // Ready for Step 6: offline counter pickup
        created_at: new Date().toISOString(),
        collected_at: null,
        due_date: null,
        counter_officer: null,
        condition_on_checkout: inv.condition || 'Verified Working',
        condition_on_return: null,
        fine_amount: 0,
        refunded_deposit: 0,
        returned_at: null
      };

      localStore.rentals.unshift(rentalRecord);
      createdRentals.push(rentalRecord);
    }

    // Step 5: Capture payment in ledger
    const paymentRecord = {
      id: `pay-${uuidv4().slice(0, 8)}`,
      rental_id: createdRentals[0].id,
      user_id: userId,
      user_email: userEmail,
      amount: grandTotal,
      security_deposit_portion: totalDeposit,
      rental_fee_portion: totalRentalFee,
      payment_method: payment_method || 'OFFLINE_STORE_CASH',
      status: payment_method === 'OFFLINE_STORE_CASH' ? 'PENDING_OFFLINE_PAYMENT' : 'PAID',
      transaction_ref: payment_reference || (payment_method === 'UPI_QR' ? `UPI-QR-REF-${Date.now().toString().slice(-6)}` : `STORE-TOKEN-${pickupToken}`),
      offline_token: pickupToken,
      created_at: new Date().toISOString()
    };

    localStore.payments.unshift(paymentRecord);

    return res.status(201).json({
      success: true,
      message: `Step 4 & 5 Complete: Order processed successfully. Present your Offline Token (${pickupToken}) at VIVA ECE Lab Counter for pickup (Step 6).`,
      data: {
        pickup_token: pickupToken,
        rentals: createdRentals,
        payment: paymentRecord,
        summary: {
          items_count: createdRentals.length,
          rental_fee: totalRentalFee,
          security_deposit: totalDeposit,
          total_payable: grandTotal
        }
      }
    });
  } catch (err) {
    console.error('[Create Rental Error]', err);
    return res.status(500).json({ success: false, message: 'Internal error processing rental order' });
  }
}

// Student: List my active and historical rentals
async function getUserRentals(req, res) {
  try {
    const userId = req.user.id;
    const rentals = localStore.rentals.filter(r => r.user_id === userId);

    // Compute live countdown/due-date tracker metadata for Step 6
    const enriched = rentals.map(r => {
      let timeRemainingMs = null;
      let isOverdue = false;
      let humanRemaining = null;

      if (r.status === 'COLLECTED' && r.due_date) {
        const now = Date.now();
        const due = new Date(r.due_date).getTime();
        timeRemainingMs = due - now;

        if (timeRemainingMs <= 0) {
          isOverdue = true;
          const overdueHours = Math.floor(Math.abs(timeRemainingMs) / (1000 * 60 * 60));
          humanRemaining = `${overdueHours}h OVERDUE`;
        } else {
          const days = Math.floor(timeRemainingMs / (1000 * 60 * 60 * 24));
          const hours = Math.floor((timeRemainingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          humanRemaining = days > 0 ? `${days}d ${hours}h left` : `${hours}h left`;
        }
      }

      return {
        ...r,
        time_remaining_ms: timeRemainingMs,
        is_overdue: isOverdue,
        human_remaining: humanRemaining
      };
    });

    return res.json({ success: true, data: enriched });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error retrieving student rentals' });
  }
}

// Step 6: Explicit COLLECTED State Handler
// PATCH /api/rentals/:id/collect
async function collectRental(req, res) {
  try {
    const { id } = req.params;
    const { counter_officer, token_scanned } = req.body;

    // Can find by ID or pickup_token
    const rental = localStore.rentals.find(r => r.id === id || r.pickup_token === id);

    if (!rental) {
      return res.status(404).json({ success: false, message: `Rental record not found for query '${id}'` });
    }

    if (rental.status === 'COLLECTED') {
      return res.status(400).json({ success: false, message: 'This rental has already been marked as COLLECTED' });
    }

    if (rental.status === 'RETURNED') {
      return res.status(400).json({ success: false, message: 'Cannot collect an already returned rental' });
    }

    const officer = counter_officer || req.user?.name || 'Prof. K. Venkatesh (Lab In-Charge)';
    const collectedAt = new Date();
    const durationDays = rental.duration_days || 7;
    const dueDate = new Date(collectedAt.getTime() + durationDays * 24 * 60 * 60 * 1000);

    rental.status = 'COLLECTED';
    rental.collected_at = collectedAt.toISOString();
    rental.due_date = dueDate.toISOString();
    rental.counter_officer = officer;
    rental.token_verified = token_scanned || rental.pickup_token;

    // Update payment ledger if cash at counter
    const payment = localStore.payments.find(p => p.rental_id === rental.id || p.offline_token === rental.pickup_token);
    if (payment && payment.status === 'PENDING_OFFLINE_PAYMENT') {
      payment.status = 'PAID';
      payment.paid_at = collectedAt.toISOString();
      payment.collected_by = officer;
    }

    return res.json({
      success: true,
      message: `Step 6 complete: Rental ${rental.id} has been handed over at the college counter. Status transitioned to COLLECTED. Due date set to ${dueDate.toLocaleDateString('en-IN')}. Live tracker active in Student Account.`,
      data: {
        id: rental.id,
        item_name: rental.item_name,
        status: rental.status,
        pickup_token: rental.pickup_token,
        collected_at: rental.collected_at,
        due_date: rental.due_date,
        counter_officer: rental.counter_officer,
        duration_days: rental.duration_days
      }
    });
  } catch (err) {
    console.error('[Collect Rental Error]', err);
    return res.status(500).json({ success: false, message: 'Error updating rental to COLLECTED state' });
  }
}

// Step 7: Explicit Return / Complete State Handler
// PATCH /api/rentals/:id/return
async function returnRental(req, res) {
  try {
    const { id } = req.params;
    const { condition_on_return, damage_fine, late_fine, notes } = req.body;

    const rental = localStore.rentals.find(r => r.id === id);

    if (!rental) {
      return res.status(404).json({ success: false, message: `Rental record ${id} not found` });
    }

    if (rental.status === 'RETURNED') {
      return res.status(400).json({ success: false, message: 'This rental is already marked as RETURNED and settled' });
    }

    const returnCondition = condition_on_return || 'GOOD';
    const damageFine = parseFloat(damage_fine || 0);
    
    // Auto-calculate late fine if not explicitly passed
    let calculatedLateFine = parseFloat(late_fine || 0);
    if (rental.due_date && new Date() > new Date(rental.due_date) && !late_fine) {
      const overdueDays = Math.ceil((new Date() - new Date(rental.due_date)) / (1000 * 60 * 60 * 24));
      calculatedLateFine = overdueDays * (rental.daily_rate || 10) * 1.5; // 1.5x daily rate overdue fine
    }

    const totalFines = damageFine + calculatedLateFine;
    const refundedDeposit = Math.max(0, (rental.security_deposit || 0) - totalFines);

    // 1. Update Rental Status
    rental.status = 'RETURNED';
    rental.returned_at = new Date().toISOString();
    rental.condition_on_return = returnCondition;
    rental.fine_amount = totalFines;
    rental.refunded_deposit = refundedDeposit;
    rental.inspector_notes = notes || `Inspected at ECE Lab counter. Condition: ${returnCondition}.`;
    rental.inspected_by = req.user?.name || 'Lab Technician';

    // 2. Automated Stock Restock in Inventory
    const invItem = localStore.inventory.find(i => i.id === rental.item_id);
    if (invItem) {
      invItem.stock += 1;
      invItem.is_available = true;
      if (returnCondition === 'DAMAGED_UNUSABLE') {
        invItem.condition = 'Needs Repair / Lab Tested';
      }
    }

    // 3. Automated Refund Ledger Entry in Payments
    const refundLedgerEntry = {
      id: `ref-${uuidv4().slice(0, 8)}`,
      rental_id: rental.id,
      user_id: rental.user_id,
      user_email: rental.user_email,
      amount: -refundedDeposit, // Credit back to student
      total_deposit_held: rental.security_deposit,
      fines_deducted: totalFines,
      net_refund: refundedDeposit,
      payment_method: 'DEPOSIT_REFUND',
      status: 'REFUNDED',
      transaction_ref: `REF-DEP-${rental.pickup_token}`,
      created_at: new Date().toISOString()
    };
    localStore.payments.unshift(refundLedgerEntry);

    return res.json({
      success: true,
      message: `Step 7 complete: Component ${rental.item_name} officially returned. Physical condition assessed as ${returnCondition}. Stock restocked (+1). Security deposit ₹${rental.security_deposit} settled: Fines ₹${totalFines}, Net refund ₹${refundedDeposit} logged to financial ledger.`,
      data: {
        rental,
        settlement: {
          original_deposit: rental.security_deposit,
          damage_fine: damageFine,
          late_fine: calculatedLateFine,
          total_fines: totalFines,
          refunded_amount: refundedDeposit
        },
        refund_ledger: refundLedgerEntry,
        restocked_inventory: invItem ? { id: invItem.id, new_stock: invItem.stock } : null
      }
    });
  } catch (err) {
    console.error('[Return Rental Error]', err);
    return res.status(500).json({ success: false, message: 'Error processing rental return' });
  }
}

module.exports = {
  createRental,
  getUserRentals,
  collectRental,
  returnRental
};
