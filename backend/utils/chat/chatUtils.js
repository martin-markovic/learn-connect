import User from "../../models/users/userModel.js";

export const findCommonClassroom = async (userId, receiverName) => {
  const user = await User.findById(userId).populate("classrooms");
  const messageReceiver = await User.findOne({ name: receiverName }).populate(
    "classrooms"
  );

  if (!user || !messageReceiver) {
    throw new Error("User or message receiver not found");
  }

  const commonClassroom = user.classrooms.find((classroom) =>
    messageReceiver.classrooms.some(
      (receiverClassroom) =>
        receiverClassroom._id.toString() === classroom._id.toString()
    )
  );

  if (!commonClassroom) {
    throw new Error("Message receiver is not in your classroom");
  }

  return { user, messageReceiver, commonClassroom };
};
