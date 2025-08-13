const Case = require('../models/Case');

// @desc Get logged-in user's cases
// @route GET /api/cases
// @access Private
const getCases = async (req, res) => {
  try {
    const query = {};

    // Clients see their own filed cases
    if (req.user.role === 'Client') {
      query.client = req.user._id;
    }

    if (req.user.role === 'Lawyer') {
      // Lawyers see:
      // 1. Cases assigned to them OR
      // 2. Unassigned cases that match their specialization
      query.$or = [
        { lawyer: req.user._id }, // already assigned
        { lawyer: null, category: req.user.specialization } // unassigned and matches specialization
      ];
    }

    const cases = await Case.find(query)
      .populate('client', 'name email') // include client info
      .populate('lawyer', 'name email specialization') // include lawyer info
      .sort({ createdAt: -1 });

    res.json(cases);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching cases' });
  }
};

const deleteCase = async (req, res) => {
  try {
    const c = await Case.findById(req.params.id);
    if (!c) return res.status(404).json({ message: 'Case not found' });

    // Check client
    if (c.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this case' });
    }

    // Use findByIdAndDelete instead of c.remove()
    await Case.findByIdAndDelete(req.params.id);

    res.json({ message: 'Case deleted successfully', id: req.params.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete case' });
  }
};



// @desc File a new case
// @route POST /api/cases
// @access Private

const { v4: uuidv4 } = require('uuid'); // npm install uuid

const createCase = async (req, res) => {
  const { title, description, category } = req.body; 

  if (!title || !description) {
    return res.status(400).json({ message: 'Title, description and category are required' });
  }

  try {
    const newCase = new Case({
      caseNumber: uuidv4(),         // generate unique caseNumber
      title,
      description,
      client: req.user._id,         // logged-in user is client
      status: 'Filed' ,
      category            // default status
    });

    const savedCase = await newCase.save();
    res.status(201).json(savedCase);
  } catch (error) {
    console.error('Error creating case:', error);
    res.status(500).json({ message: 'Failed to create case' });
  }
};

// caseController.js
const updateCaseStatus = async (req, res) => {
  try {
    const c = await Case.findById(req.params.id);
    if (!c) return res.status(404).json({ message: 'Case not found' });

    c.status = req.body.status;
    const updatedCase = await c.save();
    res.json(updatedCase); // return the updated case
  } catch (err) {
    res.status(500).json({ message: 'Failed to update case status' });
  }
};


module.exports = { getCases, createCase, updateCaseStatus, deleteCase };
