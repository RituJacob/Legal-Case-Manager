const fileRepository = require('../repositories/fileRepository');
const { getStorageService } = require('../services/storage/storageFactory');
const fs = require('fs');
const path = require('path');

const storageService = getStorageService();

//   code to upload file
// route   POST /api/files/upload
exports.uploadFile = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Please upload a file' });
    }

    try {
        const fileData = {
            userId: req.user.id,
            originalName: req.file.originalname,
            path: req.file.path,
            size: req.file.size,
        };
        const newFile = await fileRepository.create(fileData);
        res.status(201).json({ message: 'File uploaded successfully', file: newFile });
    } catch (error) {
        res.status(500).json({ message: 'Server error while uploading file.' });
    }
};

// code to list files
// route   GET /api/files
exports.getFiles = async (req, res) => {
    try {
        const files = await fileRepository.findByUserId(req.user.id);
        res.json(files);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// code to rename a file
// route -  PUT /api/files/:id
exports.renameFile = async (req, res) => {
    try {
        const { newName } = req.body;
        
        const file = await fileRepository.findById(req.params.id);

        //  ensure the file exists and the user owns it for safety
        if (!file || file.userId.toString() !== req.user.id) {
            return res.status(404).json({ message: 'File not found' });
        }

        //Get file extension
        const fileExtension = path.extname(file.originalName);
        
        
        // This just updates the 'originalName' in the database. 
        // only changing the user-facing name to prevent complex logic
        
        file.originalName = newName.trim() + fileExtension;

        const updatedFile = await fileRepository.save(file);

        res.json({ message: 'File renamed successfully', file: updatedFile });

    } catch (error) {
        console.error('RENAME FILE ERROR: ', error);
        res.status(500).json({ message: 'Server error while renaming file.' });
    }
};


//   Delete a file
// route   DELETE /api/files/:id
exports.deleteFile = async (req, res) => {
    try {
        const file = await fileRepository.findById(req.params.id);

        if (!file || file.userId.toString() !== req.user.id) {
            return res.status(404).json({ message: 'File not found' });
        }

        storageService.delete(file.path);
        
        // Delete the record from the database
        await fileRepository.deleteById(req.params.id);

        res.json({ message: 'File deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while deleting file.' });
    }
};