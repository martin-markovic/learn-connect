import Friend from "../../models/users/friendModel.js";
import User from "../../models/users/userModel.js";

export const getFriendList = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const friendList = await Friend.find(
      {
        $or: [{ sender: userId }, { receiver: userId }],
        status: { $ne: "blocked" },
      },
      "sender receiver status"
    )
      .populate("sender", "name")
      .populate("receiver", "name");

    return res.status(200).json(friendList.length ? friendList : []);
  } catch (error) {
    console.error("Error fetching friend list", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getUserList = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "User not authorized" });
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

    const userList = await User.find({ _id: { $nin: blockedUserIds } }).select(
      "name"
    );

    return res.status(200).json(userList);
  } catch (error) {
    console.error("Error fetching list of users", error);
    return res.status(500).json({ message: "Server error" });
  }
};
