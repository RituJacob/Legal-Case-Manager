const mongoose = require('mongoose');

const caseSchema = new mongoose.Schema({
  caseNumber: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, enum: ['Civil', 'Criminal', 'Family', 'Corporate'], required: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lawyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  status: { type: String, enum: ['Filed','In Progress','Hearing Scheduled','Closed'], default: 'Filed' },
  evidence: [{ type: mongoose.Schema.Types.ObjectId, ref: 'File' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

caseSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// ✅ Safe export to avoid OverwriteModelError
module.exports = mongoose.models.Case || mongoose.model('Case', caseSchema);
