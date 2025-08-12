const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middleware/auth');
const { createCase, getCases, getCaseById, updateCase, deleteCase, addEvidence, addHearing } = require('../controllers/caseController');

// simple disk storage — for production consider S3
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

router.use(protect);

router.post('/', createCase); // create case
router.get('/', getCases); // list
router.get('/:id', getCaseById);
router.put('/:id', updateCase);
router.delete('/:id', deleteCase);

router.post('/:id/evidence', upload.single('evidence'), addEvidence);
router.post('/:id/hearings', addHearing);

module.exports = router;
