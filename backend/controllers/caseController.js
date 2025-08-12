const Case = require('../models/caseModel');
const path = require('path');
const fs = require('fs');

// @desc    Create new case (case filing)
// @route   POST /api/cases
// @access  Private
const createCase = async (req, res) => {
  try {
    const { title, description, clientId, lawyerId, hearingDate } = req.body;

    let evidenceFiles = [];
    if (req.files && req.files.length > 0) {
      evidenceFiles = req.files.map(file => `/uploads/evidence/${file.filename}`);
    }

    const newCase = await Case.create({
      title,
      description,
      client: clientId,
      lawyer: lawyerId || null,
      evidence: evidenceFiles,
      hearingDate: hearingDate || null,
      status: 'Filed'
    });

    res.status(201).json(newCase);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Case filing failed' });
  }
};

// @desc    Get all cases
// @route   GET /api/cases
// @access  Private
const getCases = async (req, res) => {
  try {
    let cases;
    if (req.user.role === 'Admin') {
      cases = await Case.find().populate('client lawyer', 'name email');
    } else if (req.user.role === 'Lawyer') {
      cases = await Case.find({ lawyer: req.user._id }).populate('client lawyer', 'name email');
    } else {
      cases = await Case.find({ client: req.user._id }).populate('client lawyer', 'name email');
    }
    res.json(cases);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Fetching cases failed' });
  }
};

// @desc    Get single case by ID
// @route   GET /api/cases/:id
// @access  Private
const getCaseById = async (req, res) => {
  try {
    const caseData = await Case.findById(req.params.id).populate('client lawyer', 'name email');
    if (!caseData) {
      return res.status(404).json({ message: 'Case not found' });
    }
    res.json(caseData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Fetching case failed' });
  }
};

// @desc    Update case (status, hearing schedule, lawyer assignment)
// @route   PUT /api/cases/:id
// @access  Private
const updateCase = async (req, res) => {
  try {
    const caseData = await Case.findById(req.params.id);
    if (!caseData) {
      return res.status(404).json({ message: 'Case not found' });
    }

    const updates = req.body;
    Object.assign(caseData, updates);

    await caseData.save();
    res.json(caseData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Updating case failed' });
  }
};

// @desc    Delete case
// @route   DELETE /api/cases/:id
// @access  Private
const deleteCase = async (req, res) => {
  try {
    const caseData = await Case.findById(req.params.id);
    if (!caseData) {
      return res.status(404).json({ message: 'Case not found' });
    }

    await caseData.remove();
    res.json({ message: 'Case deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Deleting case failed' });
  }
};

module.exports = {
  createCase,
  getCases,
  getCaseById,
  updateCase,
  deleteCase
};
