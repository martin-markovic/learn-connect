import Notification from "../../models/users/notificationModel.js";

export const getNotifications = async (req, res) => {
  try {
    const userId = req.user?._id;

    const notifications = await Notification.findOne({ _id: userId }).sort({
      date: -1,
    });

    res.status(200).json(notifications);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const userId = req.user?._id;

    const notification = await Notification.findOne({ _id: notificationId });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    const userNotified = notification.readBy.includes(userId);

    if (userNotified) {
      return res.status(400).json({ message: "User is already notified" });
    }

    await Notification.updateOne(
      { _id: notificationId },
      { $push: { readBy: userId } }
    );

    res.status(200).json(notificationId);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateNotifications = async (req, res) => {
  try {
    const userId = req.user?._id;

    const result = await Notification.updateMany(
      { readBy: { $ne: userId } },
      { $push: { readBy: userId } }
    );

    if (result.nModified === 0) {
      return res
        .status(400)
        .json({ message: "All notifications are already read" });
    }

    res.status(200);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
