const express = require('express');
const { getCases, createCase, updateCaseStatus, deleteCase } = require('../controllers/CaseController');
const { protect } = require('../middleware/authMiddleware');
const { validateCaseCreation } = require('../middleware/validationMiddleware');

const router = express.Router();

router.post('/', protect, validateCaseCreation, createCase);
router.get('/', protect, getCases);
router.patch('/:id', protect, updateCaseStatus);
router.delete('/:id', protect, deleteCase);

module.exports = router;
