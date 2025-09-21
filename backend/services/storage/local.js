const fs = require('fs');

class LocalStorage {
    /**
     * Deletes a file from the local filesystem.
     * @param {string} filePath - The path to the file (e.g., 'uploads/file-1.txt').
     */
    delete(filePath) {
        try {
            // Use synchronous unlink to ensure it completes.
            fs.unlinkSync(filePath);
            console.log(`Successfully deleted file from local storage: ${filePath}`);
        } catch (err) {
            // logs the error but does't throw it, so the DB record can still be deleted.
            console.error(`Failed to delete file from disk: ${filePath}`, err);
        }
    }

    
}

module.exports = new LocalStorage();