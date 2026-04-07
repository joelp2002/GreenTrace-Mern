const express = require('express');
const siteController = require('../controllers/siteController');
const { protect, canAccessSites, canMutateSites } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

const router = express.Router();

router.get('/near', protect, canAccessSites, siteController.listNear);
router.get('/', protect, canAccessSites, siteController.list);
router.get('/:id', protect, canAccessSites, siteController.getOne);
router.post('/', protect, canMutateSites, siteController.create);
router.patch('/:id', protect, canMutateSites, siteController.update);
router.post('/:id/photos', protect, canMutateSites, upload.single('photo'), siteController.addPhoto);
router.delete('/:id', protect, canMutateSites, siteController.remove);

module.exports = router;
