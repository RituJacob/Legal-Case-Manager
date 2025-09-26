
const express = require('express');
const { getCases, createCase, updateCaseStatus, deleteCase, assignLawyerToCase } = require('../controllers/CaseController');
const { protect } = require('../middleware/authMiddleware');
const { validateCaseCreation } = require('../middleware/validationMiddleware');

const router = express.Router();

router.post('/', protect, validateCaseCreation, createCase);
router.get('/', protect, getCases);
router.patch('/:id/status', protect, updateCaseStatus);
router.patch('/:id/assign', protect, assignLawyerToCase); // New route for assigning a lawyer
router.delete('/:id', protect, deleteCase);

module.exports = router;

