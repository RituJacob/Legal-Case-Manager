const multer = require('multer');
const path = require('path');

// Set up storage engine
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: function (req, file, cb) {        
        cb(null, 'file-' + Date.now() + path.extname(file.originalname));
    }
});

// Initialize upload variable and specify it will handle a single file from 'myFile' form field
const upload = multer({
    storage: storage,
    limits: { fileSize: 10000000 }, // Limit file size
}).single('myFile');

module.exports = upload;