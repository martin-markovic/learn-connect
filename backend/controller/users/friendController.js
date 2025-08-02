export const getFriendList = (Friend) => async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      throw {
        statusCode: 403,
        message: "User id is required",
      };
    }

    const authUserId = req?.user?._id;

    if (!authUserId) {
      throw {
        statusCode: 401,
        message: "User is not authenticated",
      };
    }

    const friendList = await Friend.find(
      {
        $or: [{ sender: userId }, { receiver: userId }],
        status: { $nin: ["blocked", null] },
      },
      "sender receiver status"
    )
      .populate("sender", "name avatar")
      .populate("receiver", "name avatar");

    return res.status(200).json(friendList || []);
  } catch (error) {
    console.error("Error fetching friend list", error);

    return res
      .status(error?.statusCode || 500)
      .json({ message: error.message || "Server error" });
  }
};

export const getUserList = (Friend, User) => async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      throw { statusCode: 403, message: "User id is required" };
    }

    const blockedUsers = await Friend.find({
      $or: [
        { sender: userId, status: "blocked" },
        { receiver: userId, status: "blocked" },
      ],
    });

    const blockedUserIds = blockedUsers.map((rel) =>
      String(rel.sender) === String(userId) ? rel.receiver : rel.sender
    );

    const userList = await User.find(
      {
        _id: { $nin: blockedUserIds },
      },
      "name avatar"
    );

    return res.status(200).json(userList);
  } catch (error) {
    console.error("Error fetching list of users", error);
    return res
      .status(error.statusCode || 500)
      .json({ message: error.message || "Server error" });
  }
};
