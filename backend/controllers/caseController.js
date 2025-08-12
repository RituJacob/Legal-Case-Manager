const Case = require('../models/Case');

// @desc Get logged-in user's cases
// @route GET /api/cases
// @access Private
const getCases = async (req, res) => {
  try {
    const cases = await Case.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(cases);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching cases' });
  }
};

// @desc File a new case
// @route POST /api/cases
// @access Private

const { v4: uuidv4 } = require('uuid'); // npm install uuid

const createCase = async (req, res) => {
  const { title, description } = req.body; // no category

  if (!title || !description) {
    return res.status(400).json({ message: 'Title and description are required' });
  }

  try {
    const newCase = new Case({
      caseNumber: uuidv4(),         // generate unique caseNumber
      title,
      description,
      client: req.user._id,         // logged-in user is client
      status: 'Filed'               // default status
    });

    const savedCase = await newCase.save();
    res.status(201).json(savedCase);
  } catch (error) {
    console.error('Error creating case:', error);
    res.status(500).json({ message: 'Failed to create case' });
  }
};


module.exports = { getCases, createCase };
