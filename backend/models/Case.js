const mongoose = require('mongoose');

const evidenceSchema = new mongoose.Schema({
  fileName: String,
  fileUrl: String,
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  uploadedAt: { type: Date, default: Date.now }
});

const hearingSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  notes: String,
  outcome: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const accessSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  permission: { type: String, enum: ['View','Edit'], default: 'View' }
});

const caseSchema = new mongoose.Schema({
  caseNumber: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lawyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // assigned lawyer
  status: { type: String, enum: ['Filed','In Progress','Hearing Scheduled','Closed'], default: 'Filed' },
  evidence: [evidenceSchema],
  hearings: [hearingSchema],
  accessList: [accessSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

caseSchema.pre('save', function(next){
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Case', caseSchema);
