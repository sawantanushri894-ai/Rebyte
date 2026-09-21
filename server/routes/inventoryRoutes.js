const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');

router.get('/', inventoryController.getAll);
router.get('/categories', inventoryController.getCategories);
router.get('/:id', inventoryController.getById);

module.exports = router;
