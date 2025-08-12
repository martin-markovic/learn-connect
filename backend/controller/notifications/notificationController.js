export const getNotifications = (Notification, User) => async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!userId) {
      throw { statusCode: 403, message: "User id is required" };
    }

    const userExists = await User.findById(userId);

    if (!userExists) {
      throw { statusCode: 404, message: "User does not exist" };
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
