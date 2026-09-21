const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { authenticate } = require('../middleware/auth');

router.post('/', authenticate, projectController.createProject);
router.get('/my', authenticate, projectController.getUserProjects);

module.exports = router;
