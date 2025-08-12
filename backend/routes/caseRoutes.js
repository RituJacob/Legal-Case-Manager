const express = require('express');
const { getCases, createCase } = require('../controllers/CaseController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .get(protect, getCases)
  .post(protect, createCase);

module.exports = router;
