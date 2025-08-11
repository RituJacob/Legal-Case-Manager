
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

const caseSchema = new mongoose.Schema({
    caseNumber: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },

    // Link to clients and lawyers (assuming they are users)
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    lawyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    status: { 
        type: String, 
        enum: ['Filed', 'In Progress', 'Hearing Scheduled', 'Closed'], 
        default: 'Filed' 
    },

    // Evidence & documents
    evidence: [
        {
            fileName: String,
            fileUrl: String, // Could be local path or cloud storage URL
            uploadedAt: { type: Date, default: Date.now }
        }
    ],

    // Hearing schedule
    hearings: [
        {
            date: { type: Date, required: true },
            notes: String,
            outcome: String
        }
    ],

    // Access control
    accessList: [
        {
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            role: { type: String, enum: ['View', 'Edit'], default: 'View' }
        }
    ],

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

caseSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Case', caseSchema);
module.exports = mongoose.model('User', userSchema);
