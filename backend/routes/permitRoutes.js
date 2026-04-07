const express = require('express');
const permitController = require('../controllers/permitController');
const { protect, canAccessPermits, canMutatePermits } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, canAccessPermits, permitController.list);
router.get('/:id', protect, canAccessPermits, permitController.getOne);
router.post('/', protect, canMutatePermits, permitController.create);
router.patch('/:id', protect, canMutatePermits, permitController.update);
router.delete('/:id', protect, canMutatePermits, permitController.remove);

module.exports = router;
