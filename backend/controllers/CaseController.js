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
    cases.sort();
    res.json(cases);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server error fetching cases' });
  }
};
// // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // 
// DEFUNCTED
// @desc Sort Cases in descending order
const sortCasesTitle = async (req, res) => {
  try {
    const caseRepository = caseRepositoryProxyFactory(req.user);
    const cases = await caseRepository.findForUser(req.user);
    cases.sort( {title : 1 });
    res.json(cases);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server error sorting cases' });
  }
};
// // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // 

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
    const user = req.user; // The lawyer or client performing the action

    const caseToUpdate = await Case.findById(caseId);
    if (!caseToUpdate) {
      return res.status(404).json({ message: 'Case not found' });
    }

    if (status === 'In Progress') {
      if (caseToUpdate.status === 'Open') {
        // First time accepting → use OOP method
        const updatedCase = await caseToUpdate.acceptCase(user);
        return res.json(updatedCase);
      } else {
        // Already accepted → just use repository update
        const caseRepository = caseRepositoryProxyFactory(req.user);
        const updatedCase = await caseRepository.updateCaseStatus(caseId, status);
        return res.json(updatedCase);
      }
    } 
    else if (status === 'Closed') {
      if (caseToUpdate.status === 'In Progress') {
        const updatedClosedCase = await caseToUpdate.closeCase(user);
        return res.json(updatedClosedCase);
      } else {
        return res.status(400).json({ message: 'Case cannot be closed from current status' });
      }
    } 
    else {
      // Fallback for any other statuses
      const caseRepository = caseRepositoryProxyFactory(req.user);
      const updatedCase = await caseRepository.updateCaseStatus(caseId, status);
      return res.json(updatedCase);
    }

  } catch (err) {
    console.error('Error updating case status:', err);
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
