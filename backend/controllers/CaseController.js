const caseRepositoryProxyFactory = require('../repositories/caseRepositoryProxy');
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

module.exports = { getCases, createCase, updateCaseStatus, deleteCase };
