const express = require('express');
const authController = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);

router.get('/me', protect, authController.me);
router.patch('/me', protect, authController.updateProfile);

// ADMIN only staff/user management
router.post('/staff', protect, authorize('ADMIN'), authController.register);
router.get('/users', protect, authorize('ADMIN'), authController.listUsers);
router.patch('/users/:id/role', protect, authorize('ADMIN'), authController.updateUserRole);

module.exports = router;