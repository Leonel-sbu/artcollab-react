const Notification = require("../models/Notification");

/* GET ALL */
exports.getNotifications = async (req, res) => {
  // Return empty notifications for unauthenticated users
  if (!req.user) {
    return res.status(200).json({
      success: true,
      count: 0,
      notifications: [],
    });
  }

  const notifications = await Notification.find({
    recipient: req.user._id,
  })
    .populate("sender", "name avatar")
    .populate("post", "content")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: notifications.length,
    notifications,
  });
};

/* MARK ONE */
exports.markAsRead = async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: "Notification not found",
    });
  }

  if (notification.recipient.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: "Not authorized",
    });
  }

  notification.isRead = true;
  await notification.save();

  res.status(200).json({
    success: true,
    message: "Notification marked as read",
  });
};

/* MARK ALL */
exports.markAllAsRead = async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user._id, isRead: false },
    { $set: { isRead: true } }
  );

  res.status(200).json({
    success: true,
    message: "All notifications marked as read",
  });
};
