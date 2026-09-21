const express = require('express');
const router = express.Router();
const donationController = require('../controllers/donationController');
const { authenticate } = require('../middleware/auth');

router.post('/', authenticate, donationController.createDonation);
router.get('/my', authenticate, donationController.getUserDonations);

module.exports = router;
