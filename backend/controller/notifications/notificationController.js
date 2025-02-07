import Notification from "../../models/users/notificationModel.js";

export const getNotifications = async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!userId) {
      return response.status(401).json({ message: "User not authorized" });
    }

    const unreadNotifications = await Notification.find({
      receiver: userId,
      readBy: { $nin: [userId] },
    });

    return res.status(200).json(unreadNotifications || []);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
