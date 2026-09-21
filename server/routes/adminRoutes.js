const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, requireAdmin } = require('../middleware/auth');

// Strict RBAC middleware enforced on all admin endpoints
router.use(authenticate, requireAdmin);

// 1. User Management
router.get('/users', adminController.getUsers);
router.post('/users/:id/verify', adminController.verifyUser);
router.post('/users/:id/reject', adminController.rejectUser);

// 2. Inventory Management CRUD
router.get('/inventory', adminController.getInventory);
router.post('/inventory', adminController.createInventoryItem);
router.put('/inventory/:id', adminController.updateInventoryItem);
router.delete('/inventory/:id', adminController.deleteInventoryItem);

// 3. Rental & Return Management
router.get('/rentals', adminController.getAdminRentals);

// 4. Payment Management
router.get('/payments', adminController.getAdminPayments);

// 5. Donation Verification & 1-Click Restock
router.get('/donations', adminController.getAdminDonations);
router.post('/donations/:id/restock', adminController.restockDonation);

// 6. Mini Project Management
router.get('/projects', adminController.getAdminProjects);
router.patch('/projects/:id/mentor', adminController.assignMentor);

// 7. Reports & Analytics + Dynamic Revenue Sharing Slider
router.get('/analytics', adminController.getAnalytics);

// 8. Login Audit History
router.get('/audits/logins', adminController.getLoginAudits);

module.exports = router;
