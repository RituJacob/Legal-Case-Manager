const express = require('express');
const { getCases, createCase, updateCaseStatus, deleteCase } = require('../controllers/CaseController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .get(protect, getCases)
  .post(protect, createCase);

  router.patch('/:id', protect, updateCaseStatus);
router.delete('/:id', protect, deleteCase);


module.exports = router;
