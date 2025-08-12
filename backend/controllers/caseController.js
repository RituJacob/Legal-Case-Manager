const Case = require('../models/Case');
const User = require('../models/User');

// Create case (file case)
const createCase = async (req, res) => {
  try {
    const { caseNumber, title, description, clientId, lawyerId } = req.body;
    if (!caseNumber || !title || !description || !clientId) return res.status(400).json({ message: 'Missing fields' });

    // create case
    const theCase = await Case.create({
      caseNumber, title, description, client: clientId, lawyer: lawyerId || undefined,
      accessList: [
        { user: clientId, permission: 'View' },
        ...(lawyerId ? [{ user: lawyerId, permission: 'Edit' }] : [])
      ]
    });

    // update user references
    if (lawyerId) await User.findByIdAndUpdate(lawyerId, { $push: { assignedCases: theCase._id } });
    await User.findByIdAndUpdate(clientId, { $push: { clientCases: theCase._id } });

    res.status(201).json(theCase);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get list of cases — RBAC aware
const getCases = async (req, res) => {
  try {
    const user = req.user;
    let query = {};

    if (user.role === 'Admin') {
      query = {};
    } else if (user.role === 'Lawyer') {
      query = { $or: [ { lawyer: user._id }, { 'accessList.user': user._id } ] };
    } else { // Client
      query = { client: user._id };
    }

    const cases = await Case.find(query).populate('client', 'name email').populate('lawyer', 'name email');
    res.json(cases);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get single case by id (and check access)
const getCaseById = async (req, res) => {
  try {
    const theCase = await Case.findById(req.params.id).populate('client lawyer accessList.user', 'name email role');
    if (!theCase) return res.status(404).json({ message: 'Case not found' });

    // allow if admin, owner client, assigned lawyer, or in accessList
    const allowed = req.user.role === 'Admin' ||
      theCase.client.equals(req.user._id) ||
      (theCase.lawyer && theCase.lawyer.equals(req.user._id)) ||
      theCase.accessList.some(a => a.user.equals(req.user._id));

    if (!allowed) return res.status(403).json({ message: 'Forbidden' });

    res.json(theCase);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update case (only allowed by Admin or assigned Lawyer (Edit) )
const updateCase = async (req, res) => {
  try {
    const theCase = await Case.findById(req.params.id);
    if (!theCase) return res.status(404).json({ message: 'Case not found' });

    // Check permission: admin or lawyer with Edit
    const canEdit = req.user.role === 'Admin' ||
      (req.user.role === 'Lawyer' && (theCase.lawyer && theCase.lawyer.equals(req.user._id)));

    if (!canEdit) return res.status(403).json({ message: 'Forbidden' });

    const { title, description, status, lawyerId } = req.body;
    if (title) theCase.title = title;
    if (description) theCase.description = description;
    if (status) theCase.status = status;
    if (lawyerId) {
      theCase.lawyer = lawyerId;
      // ensure access list contains lawyer with Edit
      if (!theCase.accessList.some(a => a.user.equals(lawyerId))) theCase.accessList.push({ user: lawyerId, permission: 'Edit' });
    }

    await theCase.save();
    res.json(theCase);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete case (admin only)
const deleteCase = async (req, res) => {
  try {
    if (req.user.role !== 'Admin') return res.status(403).json({ message: 'Only admin can delete cases' });
    const theCase = await Case.findByIdAndDelete(req.params.id);
    if (!theCase) return res.status(404).json({ message: 'Case not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Upload evidence (multer handles file)
const addEvidence = async (req, res) => {
  try {
    const theCase = await Case.findById(req.params.id);
    if (!theCase) return res.status(404).json({ message: 'Case not found' });

    // Check permission: client (owner), assigned lawyer, or admin
    const allowed = req.user.role === 'Admin' || theCase.client.equals(req.user._id) || (theCase.lawyer && theCase.lawyer.equals(req.user._id));
    if (!allowed) return res.status(403).json({ message: 'Forbidden' });

    if (!req.file) return res.status(400).json({ message: 'No file' });

    theCase.evidence.push({
      fileName: req.file.originalname,
      fileUrl: `/uploads/${req.file.filename}`,
      uploadedBy: req.user._id
    });

    await theCase.save();
    res.json(theCase);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add hearing (schedule)
const addHearing = async (req, res) => {
  try {
    const theCase = await Case.findById(req.params.id);
    if (!theCase) return res.status(404).json({ message: 'Case not found' });

    // allow only Admin or Lawyer
    if (!['Admin','Lawyer'].includes(req.user.role)) return res.status(403).json({ message: 'Forbidden' });

    const { date, notes } = req.body;
    if (!date) return res.status(400).json({ message: 'Date required' });

    theCase.hearings.push({ date, notes, createdBy: req.user._id });
    theCase.status = 'Hearing Scheduled';

    await theCase.save();
    res.json(theCase);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createCase, getCases, getCaseById, updateCase, deleteCase, addEvidence, addHearing
};
