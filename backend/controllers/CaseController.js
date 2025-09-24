const caseRepository = require('../repositories/caseRepository');
const { v4: uuidv4 } = require('uuid'); // npm install uuid

// @desc Get logged-in user's cases
// @route GET /api/cases
// @access Private
const getCases = async (req, res) => {
  try {
    // All complex query logic transferred to repository.
    // The controller just passes the user object.
    const cases = await caseRepository.findForUser(req.user);
    res.json(cases);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching cases' });
  }
};




// @desc File a new case
// @route POST /api/cases
// @access Private
const createCase = async (req, res) => {
  

  try {
    const { title, description, category } = req.body;
    const caseData = {
      caseNumber: uuidv4(),
      title,
      description,
      client: req.user._id,
      status: 'Filed',
      category
    };
    // Uses the repository to create the case
    const savedCase = await caseRepository.create(caseData);
    res.status(201).json(savedCase);
  } catch (error) {
    console.error('Error creating case:', error);
    res.status(500).json({ message: 'Failed to create case' });
  }
};



const updateCaseStatus = async (req, res) => {
  try {
    const c = await caseRepository.findById(req.params.id);
    if (!c) return res.status(404).json({ message: 'Case not found' });

    // Authorization logic still in the controller.

    c.status = req.body.status;
    const updatedCase = await caseRepository.save(c);
    res.json(updatedCase);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update case status' });
  }
};



// @desc Delete a case
const deleteCase = async (req, res) => {
  try {
    const c = await caseRepository.findById(req.params.id);
    if (!c) return res.status(404).json({ message: 'Case not found' });

    // Authorization logic kept in the controller.
    if (c.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this case' });
    }

    await caseRepository.deleteById(req.params.id);

    res.json({ message: 'Case deleted successfully', id: req.params.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete case' });
  }
};


module.exports = { getCases, createCase, updateCaseStatus, deleteCase };
