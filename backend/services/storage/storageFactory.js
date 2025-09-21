const localStorage = require('./local');
// const s3Storage = require('./s3'); // for implementing possible S3 storage

function getStorageService() {
    // Read the storage type from environment variables, defaulting to 'local'.
    const storageType = process.env.STORAGE_TYPE || 'local';

    if (storageType === 's3') {
        // return s3Storage;  In the future, if needed 
    }
    
    // currently, only returns the local storage service.
    return localStorage;
}

module.exports = { getStorageService };