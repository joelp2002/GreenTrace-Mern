const express = require('express');
const uploadController = require('../controllers/uploadController');
const { protect, canMutateSeedlings } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

const router = express.Router();

router.post('/', protect, canMutateSeedlings, upload.single('photo'), uploadController.uploadPhoto);

module.exports = router;
