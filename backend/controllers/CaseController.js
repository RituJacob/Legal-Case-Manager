const caseRepositoryProxyFactory = require('../repositories/caseRepositoryProxy');
const Case = require('../models/Case');
const User = require('../models/User');
const notificationService = require('../services/notificationService'); // Import the notification service
const { v4: uuidv4 } = require('uuid');

// @desc Get logged-in user's cases
const getCases = async (req, res) => {
  try {
    const caseRepository = caseRepositoryProxyFactory(req.user);
    const cases = await caseRepository.findForUser(req.user);
    res.json(cases);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server error fetching cases' });
  }
};

// @desc File a new case
const createCase = async (req, res) => {
  try {
    const caseRepository = caseRepositoryProxyFactory(req.user);

    const { title, description, category } = req.body;
    const caseData = {
      caseNumber: uuidv4(),
      title,
      description,
      client: req.user._id,
      status: 'Filed',
      category
    };

    const savedCase = await caseRepository.create(caseData);
    res.status(201).json(savedCase);
  } catch (error) {
    console.error('Error creating case:', error);
    res.status(500).json({ message: error.message || 'Failed to create case' });
  }
};

// @desc Update case status
const updateCaseStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const caseId = req.params.id;

    const caseToUpdate = await Case.findById(caseId);

    if (!caseToUpdate) {
      return res.status(404).json({ message: 'Case not found' });
    }

    // --- NOTIFICATION LOGIC ---
    if (status === 'In Progress') {
      caseToUpdate.lawyer = req.user._id;
      await caseToUpdate.populate('client');

      if (caseToUpdate.client) {
        const message = `Lawyer ${req.user.name} has accepted your case: "${caseToUpdate.title}".`;
        await notificationService.createNotification(caseToUpdate.client._id, message, caseToUpdate._id);
      }
    }
    // --- END NOTIFICATION LOGIC ---

    // Now, proceed with the existing repository logic to perform the update    
    const caseRepository = caseRepositoryProxyFactory(req.user);
    const updatedCase = await caseRepository.updateCaseStatus(req.params.id, req.body.status);

    res.json(updatedCase);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to update case status' });
  }
};

// @desc Delete case
const deleteCase = async (req, res) => {
  try {
    const caseRepository = caseRepositoryProxyFactory(req.user);
    await caseRepository.deleteById(req.params.id);
    res.json({ message: 'Case deleted successfully', id: req.params.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || 'Failed to delete case' });
  }
};

// @desc    Assign a lawyer to a case
// @route   PATCH /api/cases/:id/assign
// @access  Private
const assignLawyerToCase = async (req, res) => {
  try {
    const { lawyerId } = req.body;
    if (!lawyerId) {
      return res.status(400).json({ message: 'Lawyer ID is required' });
    }

    const caseToUpdate = await Case.findById(req.params.id);
    const lawyer = await User.findById(lawyerId);

    if (!caseToUpdate || !lawyer) {
      return res.status(404).json({ message: 'Case or Lawyer not found' });
    }

    if (lawyer.role !== 'lawyer') {
      return res.status(400).json({ message: 'Selected user is not a lawyer.' });
    }

    // Assign the lawyer and update status
    caseToUpdate.lawyer = lawyer._id;
    const updatedCase = await caseToUpdate.save();

    res.status(200).json(updatedCase);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { getCases, createCase, updateCaseStatus, deleteCase, assignLawyerToCase };
