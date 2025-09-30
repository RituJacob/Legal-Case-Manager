const Notification = require('../models/Notification');

class NotificationService {
  /**
   * Creates a notification for a user.
   * @param {string} userId - The ID of the user to notify.
   * @param {string} message - The notification message.
   * @param {string} [caseId] - Optional ID of the related case.
   */
  async createNotification(userId, message, caseId) {
    try {
      const notification = new Notification({
        user: userId,
        message,
        case: caseId,
      });
      await notification.save();
      console.log(`Notification created for user ${userId}: "${message}"`);
      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  }
}

// Export a single instance (Singleton pattern) so the rest of our app uses the same service object.
module.exports = new NotificationService();