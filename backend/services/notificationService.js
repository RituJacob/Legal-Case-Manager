const Notification = require('../models/Notification');

/**
 * Creates a notification for a user.
 * @param {string} userId - The ID of the user to notify.
 * @param {string} message - The notification message.
 * @param {string} [caseId] - Optional ID of the related case.
 */
async function createNotification(userId, message, caseId) {
  try {
    const notification = new Notification({
      user: userId,
      message,
      case: caseId,
    });
    await notification.save();
    // In a real-time system, you would emit a socket event here
    // e.g., io.to(userId).emit('new_notification', notification);
    console.log(`Notification created for user ${userId}: "${message}"`);
  } catch (error) {
    console.error('Error creating notification:', error);
  }
}

module.exports = { createNotification };