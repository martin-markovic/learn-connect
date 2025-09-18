export const createNewNotification = async (models, eventData) => {
  try {
    const { User, Notification, Quiz } = models;

    if (!User || !Notification || !Quiz) {
      throw new Error("Missing models");
    }

    const { senderId, receiverId, notificationName, quizScore, quizId } =
      eventData;

    const user = await User.findOne({
      _id: senderId,
    });

    if (!user?._id) {
      throw new Error("User does not exist");
    }

    user?.select("name");

    const { name: senderName } = user;
    let quizName;

    if (notificationName === "quiz graded") {
      const quizFound = await Quiz.findOne({ _id: quizId });

      if (!quizFound) {
        throw new Error("Quiz not found");
      }

      quizName = quizFound?.title;
    }

    const notificationData = {
      evtName: notificationName,
      userName: senderName,
      quizScore:
        quizScore !== null && quizScore !== undefined ? quizScore : undefined,
      quizName: quizName ? quizName : undefined,
    };

    const generatedMessage = generateNotificationMessage(notificationData);

    const newNotification = new Notification({
      receiver: notificationName === "quiz graded" ? senderId : receiverId,
      message: generatedMessage,
    });

    const savedNotification = await newNotification.save();

    if (!savedNotification || !savedNotification._id) {
      throw new Error("Database failure: unable to save the notification");
    }

    return { success: true, savedNotification };
  } catch (error) {
    console.error(`Error creating new notification: ${error.message}`);

    throw new Error(`Error creating new notification: ${error.message}`);
  }
};

export const markNotificationAsRead = async (models, eventData) => {
  try {
    const { Notification } = models;

    if (!Notification) {
      throw new Error("Missing models");
    }

    const { notificationId } = eventData;

    if (!notificationId) {
      throw new Error("Invalid notification id");
    }

    const notificationFound = await Notification.findOne({
      _id: notificationId,
    });

    if (!notificationFound._id) {
      throw new Error("Notification not found on server");
    }

    if (notificationFound?.isRead) {
      throw new Error("Notification already marked as read");
    }

    const expirationDate = 24 * 60 * 60 * 1000;

    const updatedNotification = await Notification.findByIdAndUpdate(
      notificationId,
      {
        $set: {
          isRead: true,
          expiresAt: new Date(Date.now() + expirationDate),
        },
      },
      { new: true }
    );

    if (!updatedNotification._id) {
      throw new Error("Database failure: unable to update the notification");
    }

    return updatedNotification._id;
  } catch (error) {
    console.error(`Error marking notification as read: ${error.message}`);

    throw new Error(`Error marking notification as read: ${error.message}`);
  }
};

export const markAllNotificationsAsRead = async (models, eventData) => {
  try {
    const { Notification } = models;

    const { senderId } = eventData;

    if (!senderId) {
      throw new Error("User not authorized");
    }

    const result = await Notification.updateMany(
      { receiver: senderId, isRead: false },
      {
        $set: {
          isRead: true,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      }
    );

    const response = {
      success: true,
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
    };

    return response;
  } catch (error) {
    console.error(`Error marking all notifications as read: ${error.message}`);

    throw new Error(
      `Error marking all notifications as read: ${error.message}`
    );
  }
};

const generateNotificationMessage = (data) => {
  const { evtName, userName, quizScore, quizName } = data;

  if (evtName === "new friend request") {
    return `${userName} sent you a friend request`;
  }

  if (evtName === "friend request accepted") {
    return `${userName} accepted your friend request`;
  }

  if (evtName === "quiz graded") {
    return `You scored ${quizScore} ${
      quizScore === 1 ? "point" : "points"
    } on quiz ${quizName}`;
  }

  return "";
};
