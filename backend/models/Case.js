const mongoose = require('mongoose');
const notificationService = require('../services/notificationService'); // Import the notification service

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

// --- OOP METHOD ---
// This method encapsulates the business logic for a lawyer accepting a case.
caseSchema.methods.acceptCase = async function(acceptingLawyer) {
  if (this.status !== 'Filed') {
    throw new Error('Case has already been accepted or is not in a state to be accepted.');
  }

  // 1. Update the case object's data
  this.lawyer = acceptingLawyer._id;
  this.status = 'In Progress';

  // 2. Handle the side-effect (the notification)
  // We need to ensure the client is populated to get their ID
  await this.populate('client');
  if (this.client) {
    const message = `Lawyer ${acceptingLawyer.name} has accepted your case: "${this.title}".`;
    await notificationService.createNotification(this.client._id, message, this._id);
  }

  // 3. Save the changes to the database
  return this.save();
};

caseSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Notifies when case has been closed (Decorate Pattern)

caseSchema.methods.closeCase = async function(acceptingLawyer) {
  this.lawyer = acceptingLawyer;
  this.status = 'Closed';

  await this.populate('client');
  if (this.client) {
    const message = `Case ${this.title} has been closed.`;
    await notificationService.createNotification(this.client._id, message, this._id);
  }
  await this.populate('lawyer');
  if (this.admin) {
    const message = `Notice!! Case ${this.title} has been closed!`;
    await notificationService.createNotification(this.admin._id, message, this._id);
  };

  return this.save();
}

module.exports = mongoose.models.Case || mongoose.model('Case', caseSchema)