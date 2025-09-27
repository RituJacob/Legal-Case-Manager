const File = require('../models/File');

class FileRepository {
    
    // Finds file by its ID
    findById(id) {
        return File.findById(id);
    }

    // Finds all files belonging to a specific user, sorted by upload date
    findByUserId(userId) {
        return File.find({ userId: userId }).sort({ uploadDate: -1 });
    }

    // Finds all files associated with a specific case
    findByCaseId(caseId) {
        return File.find({ caseId }).sort({ uploadDate: -1 });
    }

    // Creates new file record in the database
    create(fileData) {
        return File.create(fileData);
    }

    // Saves changes to an existing Mongoose document
    save(fileDocument) {
        return fileDocument.save();
    }

    // Deletes a file record by ID
    deleteById(id) {
        return File.findByIdAndDelete(id); 
    }
}

// Export a single instance
module.exports = new FileRepository();
