const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware'); // Assuming you use this middleware
const Notification = require('../models/Notification');

// @route   GET api/notifications
// @desc    Get all notifications for the logged-in user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 }); // Show newest first
    res.json(notifications);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PATCH api/notifications/:id/read
// @desc    Mark a notification as read
// @access  Private
router.patch('/:id/read', protect, async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id }, // Ensure user owns the notification
            { read: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ msg: 'Notification not found' });
        }

        res.json(notification);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;