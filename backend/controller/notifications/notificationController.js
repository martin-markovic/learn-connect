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
