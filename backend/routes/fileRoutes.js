const express = require('express');
const { uploadFile, getFiles, renameFile, deleteFile } = require('../controllers/FileController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware'); // multer setup

const router = express.Router();

// Upload a single file
router.post('/upload', protect, upload.single('file'), uploadFile);

// Get files (optionally by caseId)
router.get('/', protect, getFiles);

// Rename file
router.put('/:id', protect, renameFile);

// Delete file
router.delete('/:id', protect, deleteFile);

module.exports = router;
