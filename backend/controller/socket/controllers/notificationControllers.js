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

    user.select("name");

    if (!user._id) {
      throw new Error("User does not exist");
    }

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

    return { success: true, savedNotification };
  } catch (error) {
    console.error(`Error creating new notification: ${error.message}`);

    throw new Error(`Error creating new notification: ${error.message}`);
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
