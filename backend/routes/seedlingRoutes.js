const express = require('express');
const seedlingController = require('../controllers/seedlingController');
const { protect, canAccessSeedlings, canMutateSeedlings } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/permit-options', protect, canAccessSeedlings, seedlingController.permitOptions);
router.get('/', protect, canAccessSeedlings, seedlingController.list);
router.get('/:id', protect, canAccessSeedlings, seedlingController.getOne);
router.post('/', protect, canMutateSeedlings, seedlingController.create);
router.patch('/:id', protect, canMutateSeedlings, seedlingController.update);
router.delete('/:id', protect, canMutateSeedlings, seedlingController.remove);

module.exports = router;
