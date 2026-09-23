import Notification from "../model/Notification.model.js";

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Notifications fetched successfully",
      count: notifications.length,
      notifications,
    });
  } catch (err) {
    console.error("Get notifications error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findById(id);

    if (!notification) return res.status(404).json({ message: "Notification not found" });

    if (notification.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not allowed" });
    }

    notification.isRead = true;
    await notification.save();

    return res.status(200).json({ message: "Notification marked read", notification });
  } catch (err) {
    console.error("Mark notification error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findById(id);

    if (!notification) return res.status(404).json({ message: "Notification not found" });

    if (notification.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not allowed" });
    }

    await notification.remove();

    return res.status(200).json({ message: "Notification deleted" });
  } catch (err) {
    console.error("Delete notification error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
