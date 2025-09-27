
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    
    email: { type: String, required: true, unique: true },
    
    password: { type: String, required: true },
    
    role: { 
        type: String, 
        enum: ['Admin', 'Lawyer', 'Client'], 
        default: 'Client' 
    },
    
    specialization: { 
        type: String, 
        required: function() { return this.role === 'Lawyer'; } 
    },
    
    contactNumber: { type: String },
    
    address: { type: String },
    
    profilePicture: { type: String }, // store file URL or path

    // For lawyers: list of assigned cases
    assignedCases: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'Case' }
    ],

    // For clients: list of their cases
    clientCases: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'Case' }
    ],

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Update 'updatedAt' timestamp
userSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('User', userSchema);
