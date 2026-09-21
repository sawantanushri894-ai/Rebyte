const express = require('express');
const router = express.Router();
const rentalController = require('../controllers/rentalController');
const { authenticate } = require('../middleware/auth');

// Step 3-4 & 5: Create Rental with Mixed Basket & Payment Token
router.post('/', authenticate, rentalController.createRental);

// Student: List active and historical rentals with live countdown tracker
router.get('/my', authenticate, rentalController.getUserRentals);

// Step 6: Explicit COLLECTED State Handler (tied to offline token scan / counter sign-off)
router.patch('/:id/collect', authenticate, rentalController.collectRental);

// Step 7: Explicit Return / Complete State Handler (condition check, fine/deposit calculation, stock/refund ledger entry)
router.patch('/:id/return', authenticate, rentalController.returnRental);

module.exports = router;
