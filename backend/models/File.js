const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    originalName: { type: String, required: true },
    path: { type: String, required: true }, // Path on the server file system
    size: { type: Number, required: true },
    uploadDate: { type: Date, default: Date.now },
});

module.exports = mongoose.model('File', fileSchema);