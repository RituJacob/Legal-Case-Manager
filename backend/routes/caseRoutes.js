const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  createCase,
  getCases,
  getCaseById,
  updateCase,
  deleteCase
} = require('./controllers/caseController');

const router = express.Router();

// Client files a case
router.post('/', protect, createCase);

// Get all cases (client sees their own, admin/lawyer sees assigned)
router.get('/', protect, getCases);

// Get case by ID
router.get('/:id', protect, getCaseById);

// Update a case
router.put('/:id', protect, updateCase);

// Delete a case
router.delete('/:id', protect, deleteCase);

module.exports = router;
