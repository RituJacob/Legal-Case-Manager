const fileRepository = require('../repositories/fileRepository');
const caseRepository = require('../repositories/caseRepository');
const path = require('path');
const fs = require('fs');

// Upload file
exports.uploadFile = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Please upload a file' });

  const { caseId } = req.body;

  try {
    const fileData = {
      userId: req.user.id,
      caseId,
      originalName: req.file.originalname,
      path: req.file.filename,
      size: req.file.size,
    };
    const newFile = await fileRepository.create(fileData);

    // Add reference to case's evidence
    if (caseId) {
      const caseToUpdate = await caseRepository.findById(caseId);
      if (caseToUpdate) {
        caseToUpdate.evidence.push(newFile._id);
        await caseRepository.save(caseToUpdate);
      }
    }

    res.status(201).json({ message: 'File uploaded successfully', file: newFile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while uploading file.' });
  }
};

// Get files for a case
exports.getFiles = async (req, res) => {
  const { caseId } = req.query;

  try {
    if (!caseId) return res.status(400).json({ message: 'caseId is required' });

    // Fetch files for that case
    const files = await fileRepository.findByCaseId(caseId);
    res.json(files);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while fetching files.' });
  }
};

// Rename file
exports.renameFile = async (req, res) => {
  const { newName } = req.body;
  try {
    const file = await fileRepository.findById(req.params.id);
    if (!file) return res.status(404).json({ message: 'File not found' });
    if (file.userId.toString() !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });

    const ext = path.extname(file.originalName);
    file.originalName = newName.trim() + ext;
    const updatedFile = await fileRepository.save(file);

    res.json({ message: 'File renamed', file });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete file
exports.deleteFile = async (req, res) => {
  try {
    const file = await fileRepository.findById(req.params.id);
    if (!file) return res.status(404).json({ message: 'File not found' });
    if (file.userId.toString() !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });

    // Delete file from server
    fs.unlinkSync(path.join(__dirname, '..', 'uploads', file.path));

    await fileRepository.deleteById(req.params.id);
    res.json({ message: 'File deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
