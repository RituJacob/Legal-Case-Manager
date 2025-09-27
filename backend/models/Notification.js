const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { // The user who receives the notification
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  case: { // Optional link to the relevant case
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Case'
  },
  read: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Notification', notificationSchema);