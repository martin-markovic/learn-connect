import Notification from "../../models/users/notificationModel.js";

export const getNotifications = async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!userId) {
      throw new Error({ statusCode: 403, message: "User id is required" });
    }

    const unreadNotifications = await Notification.find({
      receiver: userId,
      isRead: false,
    }).select("-__v -expiresAt -updatedAt");

    return res.status(200).json(unreadNotifications || []);
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message });
  }
};
