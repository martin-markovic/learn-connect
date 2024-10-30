import Notification from "../../models/users/notificationModel.js";
import Classroom from "../../models/classrooms/classroomModel.js";

export const getNotifications = async (req, res) => {
  try {
    const userId = req.params.userId;

    const userClassrooms = await Classroom.find({ students: userId });

    const foundNotifications = await Promise.all(
      userClassrooms.map(async (classroom) => {
        return Notification.find({ receiver: classroom._id });
      })
    );

    const unreadNotifications = foundNotifications
      .flat()
      .filter((notification) => !notification.readBy.includes(userId));

    if (!unreadNotifications.length) {
      console.log("No unreadNotifications fetched");
      return res.status(200).json([]);
    }

    return res.status(200).json(unreadNotifications);
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

    return res.status(200).json(notificationId);
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

    return res.status(200);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
