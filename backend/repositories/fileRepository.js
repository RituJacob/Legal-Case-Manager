const File = require('../models/File');

class FileRepository {
    
     // Finds file by its ID.
    findById(id) {
        return File.findById(id);
    }


    // Finds all files belonging to a specific user, sorted by upload date.
    findByUserId(userId) {
        return File.find({ userId: userId }).sort({ uploadDate: -1 });
    }

    
    // Creates new file record in the database.
    create(fileData) {
        return File.create(fileData);
    }

    
    // Saves changes to an existing Mongoose document.
    save(fileDocument) {
        return fileDocument.save();
    }

    
    // Deletes a file record by ID.
    deleteById(id) {
        // Using findByIdAndDelete is slightly more efficient than findById then remove
        return File.findByIdAndDelete(id); 
    }
}

// Export a single instance to be used across the application
module.exports = new FileRepository();