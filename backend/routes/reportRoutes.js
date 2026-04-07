const express = require('express');
const reportController = require('../controllers/reportController');
const { protect, canViewReports } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/summary', protect, canViewReports, reportController.summary);

module.exports = router;
