import Notification from "../model/Notification.model.js";

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Notifications fetched successfully",
      count: notifications.length,
      notifications,
    });
  } catch (err) {
    console.error("Get notifications error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findById(id);
    if (!notification) return res.status(404).json({ success: false, message: "Notification not found" });

    if (notification.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not allowed" });
    }

    notification.isRead = true;
    await notification.save();

    return res.status(200).json({ success: true, message: "Notification marked read", notification });
  } catch (err) {
    console.error("Mark notification error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findById(id);
    if (!notification) return res.status(404).json({ success: false, message: "Notification not found" });

    if (notification.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not allowed" });
    }

    await Notification.findByIdAndDelete(id);

    return res.status(200).json({ success: true, message: "Notification deleted" });
  } catch (err) {
    console.error("Delete notification error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
